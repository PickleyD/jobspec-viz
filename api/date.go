package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/golang/gddo/httputil/header"

	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gopkg.in/guregu/null.v4"

	"github.com/pickleyd/chainlink/core/cltest"
	"github.com/pickleyd/chainlink/core/logger"
	"github.com/pickleyd/chainlink/core/services/pg"
	"github.com/pickleyd/chainlink/core/services/pipeline"
	"github.com/pickleyd/chainlink/core/services/pipeline/mocks"
	"github.com/pickleyd/chainlink/core/testutils"
	"github.com/pickleyd/chainlink/core/testutils/configtest"
	"github.com/pickleyd/chainlink/core/testutils/evmtest"
	clhttptest "github.com/pickleyd/chainlink/core/testutils/httptest"
	"github.com/pickleyd/chainlink/core/testutils/pgtest"
	"github.com/pickleyd/chainlink/core/utils"

	"github.com/smartcontractkit/sqlx"
)

type Task struct {
	Name string
}

func newRunner(t testing.TB, db *sqlx.DB, cfg *configtest.TestGeneralConfig) (pipeline.Runner, *mocks.ORM) {
	cc := evmtest.NewChainSet(t, evmtest.TestChainOpts{DB: db, GeneralConfig: cfg})
	orm := mocks.NewORM(t)
	q := pg.NewQ(db, logger.TestLogger(t), cfg)

	orm.On("GetQ").Return(q).Maybe()
	ethKeyStore := cltest.NewKeyStore(t, db, cfg).Eth()
	c := clhttptest.NewTestLocalOnlyHTTPClient()
	r := pipeline.NewRunner(orm, cfg, cc, ethKeyStore, nil, logger.TestLogger(t), c, c)
	return r, orm
}

func Test_PipelineRunner_ExecuteTaskRuns(t *testing.T) {
	db := pgtest.NewSqlxDB(t)
	cfg := cltest.NewTestGeneralConfig(t)

	btcUSDPairing := utils.MustUnmarshalToMap(`{"data":{"coin":"BTC","market":"USD"}}`)

	// 1. Setup bridge
	s1 := httptest.NewServer(fakePriceResponder(t, btcUSDPairing, decimal.NewFromInt(9700), "", nil))
	defer s1.Close()

	bridgeFeedURL, err := url.ParseRequestURI(s1.URL)
	require.NoError(t, err)

	bt, _ := cltest.MustCreateBridge(t, db, cltest.BridgeOpts{URL: bridgeFeedURL.String()}, cfg)

	// 2. Setup success HTTP
	s2 := httptest.NewServer(fakePriceResponder(t, btcUSDPairing, decimal.NewFromInt(9600), "", nil))
	defer s2.Close()

	s4 := httptest.NewServer(fakeStringResponder(t, "foo-index-1"))
	defer s4.Close()
	s5 := httptest.NewServer(fakeStringResponder(t, "bar-index-2"))
	defer s5.Close()

	r, _ := newRunner(t, db, cfg)

	s := fmt.Sprintf(`
ds1 [type=bridge name="%s" timeout=0 requestData=<{"data": {"coin": "BTC", "market": "USD"}}>]
ds1_parse [type=jsonparse lax=false  path="data,result"]
ds1_multiply [type=multiply times=1000000000000000000]

ds2 [type=http method="GET" url="%s" requestData=<{"data": {"coin": "BTC", "market": "USD"}}>]
ds2_parse [type=jsonparse lax=false  path="data,result"]
ds2_multiply [type=multiply times=1000000000000000000]

ds3 [type=http method="GET" url="blah://test.invalid" requestData=<{"data": {"coin": "BTC", "market": "USD"}}>]
ds3_parse [type=jsonparse lax=false  path="data,result"]
ds3_multiply [type=multiply times=1000000000000000000]

ds1->ds1_parse->ds1_multiply->median;
ds2->ds2_parse->ds2_multiply->median;
ds3->ds3_parse->ds3_multiply->median;

median [type=median index=0]
ds4 [type=http method="GET" url="%s" index=1]
ds5 [type=http method="GET" url="%s" index=2]
`, bt.Name.String(), s2.URL, s4.URL, s5.URL)
	d, err := pipeline.Parse(s)
	require.NoError(t, err)

	spec := pipeline.Spec{DotDagSource: s}
	vars := pipeline.NewVarsFrom(nil)

	lggr := logger.TestLogger(t)
	_, trrs, err := r.ExecuteRun(testutils.Context(t), spec, vars, lggr)
	require.NoError(t, err)
	require.Len(t, trrs, len(d.Tasks))

	finalResults := trrs.FinalResult(lggr)
	require.Len(t, finalResults.Values, 3)
	require.Len(t, finalResults.AllErrors, 12)
	require.Len(t, finalResults.FatalErrors, 3)
	assert.Equal(t, "9650000000000000000000", finalResults.Values[0].(decimal.Decimal).String())
	assert.Nil(t, finalResults.FatalErrors[0])
	assert.Equal(t, "foo-index-1", finalResults.Values[1].(string))
	assert.Nil(t, finalResults.FatalErrors[1])
	assert.Equal(t, "bar-index-2", finalResults.Values[2].(string))
	assert.Nil(t, finalResults.FatalErrors[2])

	var errorResults []pipeline.TaskRunResult
	for _, trr := range trrs {
		if trr.Result.Error != nil && !trr.IsTerminal() {
			errorResults = append(errorResults, trr)
		}
	}
	// There are three tasks in the erroring pipeline
	require.Len(t, errorResults, 3)
}

type adapterRequest struct {
	ID          string            `json:"id"`
	Data        pipeline.MapParam `json:"data"`
	Meta        pipeline.MapParam `json:"meta"`
	ResponseURL string            `json:"responseURL"`
}

type adapterResponseData struct {
	Result *decimal.Decimal `json:"result"`
}

// adapterResponse is the HTTP response as defined by the external adapter:
// https://github.com/smartcontractkit/bnc-adapter
type adapterResponse struct {
	Data         adapterResponseData `json:"data"`
	ErrorMessage null.String         `json:"errorMessage"`
}

func dataWithResult(t *testing.T, result decimal.Decimal) adapterResponseData {
	t.Helper()
	var data adapterResponseData
	body := []byte(fmt.Sprintf(`{"result":%v}`, result))
	require.NoError(t, json.Unmarshal(body, &data))
	return data
}

func fakePriceResponder(t *testing.T, requestData map[string]interface{}, result decimal.Decimal, inputKey string, expectedInput interface{}) http.Handler {
	t.Helper()

	body, err := json.Marshal(requestData)
	require.NoError(t, err)
	var expectedRequest adapterRequest
	err = json.Unmarshal(body, &expectedRequest)
	require.NoError(t, err)
	response := adapterResponse{Data: dataWithResult(t, result)}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var reqBody adapterRequest
		payload, err := ioutil.ReadAll(r.Body)
		require.NoError(t, err)
		defer r.Body.Close()
		err = json.Unmarshal(payload, &reqBody)
		require.NoError(t, err)
		require.Equal(t, expectedRequest.Data, reqBody.Data)
		w.Header().Set("Content-Type", "application/json")
		require.NoError(t, json.NewEncoder(w).Encode(response))

		if inputKey != "" {
			m := utils.MustUnmarshalToMap(string(payload))
			if expectedInput != nil {
				require.Equal(t, expectedInput, m[inputKey])
			} else {
				require.Nil(t, m[inputKey])
			}
		}
	})
}

func fakeStringResponder(t *testing.T, s string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(s))
		require.NoError(t, err)
	})
}

func Handler(w http.ResponseWriter, r *http.Request) {

	// If the Content-Type header is present, check that it has the value
	// application/json. Note that we are using the gddo/httputil/header
	// package to parse and extract the value here, so the check works
	// even if the client includes additional charset or boundary
	// information in the header.
	if r.Header.Get("Content-Type") != "" {
		value, _ := header.ParseValueAndParams(r.Header, "Content-Type")
		if value != "application/json" {
			msg := "Content-Type header is not application/json"
			http.Error(w, msg, http.StatusUnsupportedMediaType)
			return
		}
	}

	// Use http.MaxBytesReader to enforce a maximum read of 1MB from the
	// response body. A request body larger than that will now result in
	// Decode() returning a "http: request body too large" error.
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	// Setup the decoder and call the DisallowUnknownFields() method on it.
	// This will cause Decode() to return a "json: unknown field ..." error
	// if it encounters any extra unexpected fields in the JSON. Strictly
	// speaking, it returns an error for "keys which do not match any
	// non-ignored, exported fields in the destination".
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var task Task
	err := dec.Decode(&task)

	if err != nil {
		var syntaxError *json.SyntaxError
		var unmarshalTypeError *json.UnmarshalTypeError

		switch {
		// Catch any syntax errors in the JSON and send an error message
		// which interpolates the location of the problem to make it
		// easier for the client to fix.
		case errors.As(err, &syntaxError):
			msg := fmt.Sprintf("Request body contains badly-formed JSON (at position %d)", syntaxError.Offset)
			http.Error(w, msg, http.StatusBadRequest)

		// In some circumstances Decode() may also return an
		// io.ErrUnexpectedEOF error for syntax errors in the JSON. There
		// is an open issue regarding this at
		// https://github.com/golang/go/issues/25956.
		case errors.Is(err, io.ErrUnexpectedEOF):
			msg := fmt.Sprintf("Request body contains badly-formed JSON")
			http.Error(w, msg, http.StatusBadRequest)

		// Catch any type errors, like trying to assign a string in the
		// JSON request body to a int field in our Person struct. We can
		// interpolate the relevant field name and position into the error
		// message to make it easier for the client to fix.
		case errors.As(err, &unmarshalTypeError):
			msg := fmt.Sprintf("Request body contains an invalid value for the %q field (at position %d)", unmarshalTypeError.Field, unmarshalTypeError.Offset)
			http.Error(w, msg, http.StatusBadRequest)

		// Catch the error caused by extra unexpected fields in the request
		// body. We extract the field name from the error message and
		// interpolate it in our custom error message. There is an open
		// issue at https://github.com/golang/go/issues/29035 regarding
		// turning this into a sentinel error.
		case strings.HasPrefix(err.Error(), "json: unknown field "):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			msg := fmt.Sprintf("Request body contains unknown field %s", fieldName)
			http.Error(w, msg, http.StatusBadRequest)

		// An io.EOF error is returned by Decode() if the request body is
		// empty.
		case errors.Is(err, io.EOF):
			msg := "Request body must not be empty"
			http.Error(w, msg, http.StatusBadRequest)

		// Catch the error caused by the request body being too large. Again
		// there is an open issue regarding turning this into a sentinel
		// error at https://github.com/golang/go/issues/30715.
		case err.Error() == "http: request body too large":
			msg := "Request body must not be larger than 1MB"
			http.Error(w, msg, http.StatusRequestEntityTooLarge)

		// Otherwise default to logging the error and sending a 500 Internal
		// Server Error response.
		default:
			log.Print(err.Error())
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
		return
	}

	// Call decode again, using a pointer to an empty anonymous struct as
	// the destination. If the request body only contained a single JSON
	// object this will return an io.EOF error. So if we get anything else,
	// we know that there is additional data in the request body.
	err = dec.Decode(&struct{}{})
	if err != io.EOF {
		msg := "Request body must only contain a single JSON object"
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	fmt.Fprintf(w, "Task: %+v", task)

	// Execute test

	// fmt.Fprintf(w, "Error results: %+v", errorResults)
}
