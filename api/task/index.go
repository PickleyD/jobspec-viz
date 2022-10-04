package task

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/gob"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/golang/gddo/httputil/header"
	"github.com/pickleyd/chainlink/core/config"
	"github.com/pickleyd/chainlink/core/logger"
	"github.com/pickleyd/chainlink/core/services/pipeline"
)

// type Var struct {
// 	Value  string
// 	Values []string
// 	Type   string
// }

type Task struct {
	Id      string
	Name    string
	Inputs  []string
	Options map[string]interface{}
	// Vars           map[string]Var
	VarBytesBase64 string `json:",omitempty"`
}

type Response struct {
	Value interface{}
	// User-readable
	Vars map[string]interface{}
	// Not user-readable. Base64 representation of the var bytes can be deserialised in Go.
	VarBytesBase64 string
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

	var t Task
	err := dec.Decode(&t)

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
			msg := "Request body contains badly-formed JSON"
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

	ctx := context.Background()

	varValues := make(map[string]interface{})

	// fmt.Printf("%v", t)

	// var bytes32 [32]byte
	// copy(bytes32[:], []byte("chainlink chainlink chainlink"))

	// fmt.Printf("%v", bytes32)

	// fmt.Printf("%v", []byte("stevetoshi sergeymoto"))

	// varValues["foo"] = bytes32

	// data := bytes32[:]

	// sEnc := base64.StdEncoding.EncodeToString([]byte(data))
	// fmt.Println(sEnc)

	// sDec, _ := base64.StdEncoding.DecodeString(sEnc)
	// fmt.Println(string(sDec))
	// fmt.Println()

	// uEnc := base64.URLEncoding.EncodeToString([]byte(data))
	// fmt.Println(uEnc)
	// uDec, _ := base64.URLEncoding.DecodeString(uEnc)
	// fmt.Println(string(uDec))

	// var bytes32 [32]byte
	// copy(bytes32[:], []byte("chainlink chainlink chainlink"))

	// buf := &bytes.Buffer{}
	// enc := gob.NewEncoder(buf)
	// if err := enc.Encode(bytes32); err != nil {
	// 	log.Println(err)
	// 	return
	// }
	// fmt.Println(buf.Bytes())

	// dec3 := gob.NewDecoder(ourGob)
	// if err := dec3.Decode(&thing); err != nil {
	// 	log.Println(err)
	// 	return
	// }

	by, errDecode := base64.StdEncoding.DecodeString(t.VarBytesBase64)
	if errDecode != nil {
		log.Fatal(`Failed to decode vars base64 string`, errDecode)
	} else if len(by) > 0 {
		// errUnmarshal := json.Unmarshal(by, &varValues)
		// if errUnmarshal != nil {
		// 	log.Fatal(`Failed json unmarshal of vars`, errUnmarshal)
		// }
		gob.Register(map[string]interface{}{})
		gob.Register([32]byte{})
		gob.Register(common.Address{})

		gobBytes, _ := base64.StdEncoding.DecodeString(t.VarBytesBase64)

		buf := bytes.NewBuffer(gobBytes)
		gobDec := gob.NewDecoder(buf)
		if err := gobDec.Decode(&varValues); err != nil {
			log.Fatal(err)
			return
		}
	}

	// fmt.Println("Decoded: \n ")
	// fmt.Printf("%v", varValues)

	vars := pipeline.NewVarsFrom(varValues)

	task, taskErr := getTask(TaskType(t.Name), t.Options)

	if taskErr != nil {
		// TODO: Define and return different error types
		msg := "Bad request"
		http.Error(w, msg, http.StatusBadRequest)
	}

	results := make([]pipeline.Result, 0, len(t.Inputs))
	for _, r := range t.Inputs {
		results = append(results, pipeline.Result{Value: r})
	}

	result, _ := task.Run(ctx, logger.NullLogger, vars, results)

	// Append the result to the vars
	// TODO - existence check?
	varValues[t.Id] = result.Value

	fmt.Printf("type of result.Value: %T\n", result.Value)

	// jsonVarValues, _ := json.Marshal(varValues)

	// base64VarValues := base64.StdEncoding.EncodeToString(jsonVarValues)

	gob.Register(map[string]interface{}{})
	gob.Register([32]byte{})
	gob.Register(common.Address{})

	buf := &bytes.Buffer{}
	enc := gob.NewEncoder(buf)
	if err := enc.Encode(varValues); err != nil {
		log.Println(err)
		return
	}

	// fmt.Println("1")
	// fmt.Printf("%v", varValues)
	// fmt.Println(buf.Bytes())

	base64VarValues := base64.StdEncoding.EncodeToString(buf.Bytes())

	response := Response{
		Value:          result.Value,
		Vars:           varValues,
		VarBytesBase64: base64VarValues,
	}

	// _, ok := result.Value.(map[string]interface{})
	// if ok {
	// 	out, err := json.Marshal(result.Value)
	// 	if err != nil {
	// 		panic(err)
	// 	}
	// 	response.Value = string(out)
	// } else {
	response.Value = result.Value

	// test := map[string]interface{}{
	// 	"foo": []common.Address{
	// 		common.HexToAddress("0x6c91b062a774cbe8b9bf52f224c37badf98fc40b"),
	// 		common.HexToAddress("0xc4f27ead9083c756cc2c02aaa39b223fe8d0a0e5"),
	// 		common.HexToAddress("0x749e4598819b2b0e915a02120696c7b8fe16c09c"),
	// 	},
	// 	"bar": big.NewInt(8293),
	// 	"baz": []*big.Int{big.NewInt(192), big.NewInt(4182)},
	// }
	// testOut, _ := json.Marshal(test)

	// fmt.Println(json.Valid([]byte(testOut)))

	// asBase64 := base64.StdEncoding.EncodeToString(testOut)

	// fmt.Println(asBase64)

	// by, err := base64.StdEncoding.DecodeString(asBase64)
	// if err != nil {
	// 	fmt.Println(`failed base64 Decode`, err)
	// }

	// fmt.Println(json.Valid([]byte(by)))

	// fmt.Fprintf(w, "%v", asBase64)
	// }

	jData, errJson := json.Marshal(response)
	if errJson != nil {
		log.Fatal("Error marshalling response object to json", errJson)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jData)
}

type TaskType string

func (t TaskType) String() string {
	return string(t)
}

const (
	TaskTypeHTTP TaskType = "http"
	// TaskTypeBridge           TaskType = "bridge"
	TaskTypeMean      TaskType = "mean"
	TaskTypeMedian    TaskType = "median"
	TaskTypeMode      TaskType = "mode"
	TaskTypeSum       TaskType = "sum"
	TaskTypeMultiply  TaskType = "multiply"
	TaskTypeDivide    TaskType = "divide"
	TaskTypeJSONParse TaskType = "jsonparse"
	TaskTypeCBORParse TaskType = "cborparse"
	TaskTypeAny       TaskType = "any"
	// TaskTypeVRF              TaskType = "vrf"
	// TaskTypeVRFV2            TaskType = "vrfv2"
	// TaskTypeEstimateGasLimit TaskType = "estimategaslimit"
	// TaskTypeETHCall          TaskType = "ethcall"
	// TaskTypeETHTx            TaskType = "ethtx"
	TaskTypeETHABIEncode TaskType = "ethabiencode"
	// TaskTypeETHABIEncode2    TaskType = "ethabiencode2"
	TaskTypeETHABIDecode    TaskType = "ethabidecode"
	TaskTypeETHABIDecodeLog TaskType = "ethabidecodelog"
	// TaskTypeMerge            TaskType = "merge"
	// TaskTypeLowercase        TaskType = "lowercase"
	// TaskTypeUppercase        TaskType = "uppercase"
	// TaskTypeConditional      TaskType = "conditional"
	// TaskTypeHexDecode        TaskType = "hexdecode"
	// TaskTypeBase64Decode     TaskType = "base64decode"

	// // Testing only.
	// TaskTypePanic TaskType = "panic"
	// TaskTypeMemo  TaskType = "memo"
	// TaskTypeFail  TaskType = "fail"
)

func getTask(taskType TaskType, options map[string]interface{}) (pipeline.Task, error) {

	// convert map to json
	jsonString, _ := json.Marshal(options)

	// seeing as we're just running a single task with no context
	// or pipeline variables we can just use an empty base task
	baseTask := pipeline.NewBaseTask(0, "", nil, nil, 0)

	var task pipeline.Task
	switch taskType {
	// case TaskTypePanic:
	// 	task = &PanicTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	case TaskTypeHTTP:
		var opts pipeline.HTTPTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		httpTask := pipeline.HTTPTask{
			BaseTask:                       baseTask,
			Method:                         opts.Method,
			URL:                            opts.URL,
			RequestData:                    opts.RequestData,
			AllowUnrestrictedNetworkAccess: opts.AllowUnrestrictedNetworkAccess,
			Headers:                        opts.Headers,
		}

		config := config.NewGeneralConfig(logger.NullLogger)

		c := http.DefaultClient
		httpTask.HelperSetDependencies(config, c, c)

		task = &httpTask

	// case TaskTypeBridge:
	// 	task = &BridgeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	case TaskTypeMean:
		var opts pipeline.MeanTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.MeanTask{
			BaseTask:      baseTask,
			Values:        opts.Values,
			AllowedFaults: opts.AllowedFaults,
			Precision:     opts.Precision,
		}
	case TaskTypeMedian:
		var opts pipeline.MedianTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.MedianTask{
			BaseTask:      baseTask,
			Values:        opts.Values,
			AllowedFaults: opts.AllowedFaults,
		}
	case TaskTypeMode:
		var opts pipeline.ModeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.ModeTask{
			BaseTask:      baseTask,
			Values:        opts.Values,
			AllowedFaults: opts.AllowedFaults,
		}
	case TaskTypeSum:
		var opts pipeline.SumTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.SumTask{
			BaseTask:      baseTask,
			Values:        opts.Values,
			AllowedFaults: opts.AllowedFaults,
		}
	case TaskTypeAny:
		task = &pipeline.AnyTask{}
	case TaskTypeJSONParse:
		var opts pipeline.JSONParseTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.JSONParseTask{
			BaseTask:  baseTask,
			Path:      opts.Path,
			Separator: opts.Separator,
			Data:      opts.Data,
			Lax:       opts.Lax,
		}
	// case TaskTypeMemo:
	// 	task = &MemoTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	case TaskTypeMultiply:
		var opts pipeline.MultiplyTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.MultiplyTask{
			BaseTask: baseTask,
			Times:    opts.Times,
		}
	case TaskTypeDivide:
		var opts pipeline.DivideTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.DivideTask{
			BaseTask:  baseTask,
			Divisor:   opts.Divisor,
			Precision: opts.Precision,
		}
	// case TaskTypeVRF:
	// 	task = &VRFTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeVRFV2:
	// 	task = &VRFTaskV2{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeEstimateGasLimit:
	// 	task = &EstimateGasLimitTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeETHCall:
	// 	task = &ETHCallTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeETHTx:
	// 	task = &ETHTxTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	case TaskTypeETHABIEncode:
		var opts pipeline.ETHABIEncodeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.ETHABIEncodeTask{
			BaseTask: baseTask,
			ABI:      opts.ABI,
			Data:     opts.Data,
		}
	// case TaskTypeETHABIEncode2:
	// 	task = &ETHABIEncodeTask2{BaseTask: BaseTask{id: ID, dotID: dotID}}
	case TaskTypeETHABIDecode:
		var opts pipeline.ETHABIDecodeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.ETHABIDecodeTask{
			BaseTask: baseTask,
			ABI:      opts.ABI,
			Data:     opts.Data,
		}
	case TaskTypeETHABIDecodeLog:
		var opts pipeline.ETHABIDecodeLogTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.ETHABIDecodeLogTask{
			BaseTask: baseTask,
			ABI:      opts.ABI,
			Data:     opts.Data,
			Topics:   opts.Topics,
		}
	case TaskTypeCBORParse:
		var opts pipeline.CBORParseTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.CBORParseTask{
			BaseTask: baseTask,
			Data:     opts.Data,
			Mode:     opts.Mode,
		}
	// case TaskTypeFail:
	// 	task = &FailTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeMerge:
	// 	task = &MergeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeLowercase:
	// 	task = &LowercaseTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeUppercase:
	// 	task = &UppercaseTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeConditional:
	// 	task = &ConditionalTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeHexDecode:
	// 	task = &HexDecodeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeBase64Decode:
	// 	task = &Base64DecodeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	default:
		return nil, fmt.Errorf(`unknown task type: "%v"`, taskType)
	}

	return task, nil
}
