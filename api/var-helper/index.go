package varhelper

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/golang/gddo/httputil/header"
	"github.com/pickleyd/chainlink/core/services/pipeline"
	"github.com/shopspring/decimal"
)

type Var struct {
	Value  string
	Values []string
	Type   string
	Keep   interface{}
}

type Input struct {
	Vars   map[string]Var
	Inputs []Var
	Want   Var
}

type Response struct {
	Vars64   string
	Inputs64 []string
	Want64   string
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

	var i Input
	err := dec.Decode(&i)

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

	// Vars
	varValues := make(map[string]interface{})
	if i.Vars != nil {
		for k, v := range i.Vars {
			varValues[k] = convertBasedOnTypeParam(v)
		}
	}
	varsBase64 := customToBase64(varValues)

	// Inputs
	inputsBase64 := make([]string, len(i.Inputs))
	if i.Inputs != nil {
		for k, v := range i.Inputs {
			converted := convertBasedOnTypeParam(v)
			inputsJDataB64 := customToBase64(converted)
			inputsBase64[k] = inputsJDataB64
		}
	}

	// Want
	wantBase64 := ""
	if i.Want.Value != "" || i.Want.Values != nil {
		wantBase64 = customToBase64(convertBasedOnTypeParam(i.Want))
	}

	response := Response{
		Vars64:   varsBase64,
		Inputs64: inputsBase64,
		Want64:   wantBase64,
	}

	jDataResponse, errJsonResponse := json.Marshal(response)
	if errJsonResponse != nil {
		log.Fatal("Error marshalling response object to json", errJsonResponse)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jDataResponse)
}

func customToBase64(input interface{}) string {
	return base64.StdEncoding.EncodeToString(marshalAsJsonSerializable(input))
}

// Marshal the input using Chainlink's custom marshalling logic
func marshalAsJsonSerializable(input interface{}) []byte {
	asJsonSerializable := pipeline.JSONSerializable{
		Valid: true,
		Val:   input,
	}

	jData, errJson := asJsonSerializable.MarshalJSON()
	if errJson != nil {
		log.Fatal("Error marshalling object to json", errJson)
	}

	return jData
}

func convertBasedOnTypeParam(v Var) interface{} {
	// TODO: Handle deeper nesting using recursion?
	if v.Keep != nil {
		return v.Keep
	} else if v.Type == "bytes32" {
		if v.Value != "" {
			return toBytes32(v.Value)
		} else if len(v.Values) > 0 {
			var s [][32]byte
			for _, val := range v.Values {
				s = append(s, toBytes32(val))
			}
			return s
		}
	} else if v.Type == "bytes" {
		if v.Value != "" {
			return toBytes(v.Value)
		} else if len(v.Values) > 0 {
			var s [][]byte
			for _, val := range v.Values {
				s = append(s, toBytes(val))
			}
			return s
		}
	} else if v.Type == "int" {
		if v.Value != "" {
			return toInt(v.Value)
		} else if len(v.Values) > 0 {
			var s []*big.Int
			for _, val := range v.Values {
				s = append(s, toInt(val))
			}
			return s
		}
	} else if v.Type == "float" {
		if v.Value != "" {
			return toFloat(v.Value)
		} else if len(v.Values) > 0 {
			var s []float64
			for _, val := range v.Values {
				s = append(s, toFloat(val))
			}
			return s
		}
	} else if v.Type == "decimal" {
		if v.Value != "" {
			return toDecimal(v.Value)
		} else if len(v.Values) > 0 {
			var s []decimal.Decimal
			for _, val := range v.Values {
				s = append(s, toDecimal(val))
			}
			return s
		}
	} else if v.Type == "bool" {
		if v.Value != "" {
			return toBool(v.Value)
		} else if len(v.Values) > 0 {
			var s []bool
			for _, val := range v.Values {
				s = append(s, toBool(val))
			}
			return s
		}
	} else if v.Type == "address" {
		if v.Value != "" {
			return toAddress(v.Value)
		} else if len(v.Values) > 0 {
			var s []common.Address
			for _, val := range v.Values {
				s = append(s, toAddress(val))
			}
			return s
		}
	} else if v.Type == "null" {
		return nil
	}

	fmt.Printf("Not converting variable with type of: %T\n", v.Value)
	return v.Value
}

func toInt(s string) *big.Int {
	n := new(big.Int)
	n, ok := n.SetString(s, 10)
	if !ok {
		log.Fatal("big.Int SetString error")
	}
	return n
}

func toFloat(s string) float64 {
	n, err := strconv.ParseFloat(s, 64)
	if err != nil {
		log.Fatal("big.Float SetString error")
	}
	return n
}

func toDecimal(s string) decimal.Decimal {
	n, err := decimal.NewFromString(s)
	if err != nil {
		panic(err)
	}
	return n
}

func toAddress(s string) common.Address {
	return common.HexToAddress(s)
}

func toBool(s string) bool {
	boolValue, err := strconv.ParseBool(s)
	if err != nil {
		log.Fatal(err)
	}
	return boolValue
}

func toBytes32(s string) [32]byte {
	var bytes32 [32]byte
	copy(bytes32[:], []byte(s))
	return bytes32
}

func toBytes(s string) []byte {
	return []byte(s)
}
