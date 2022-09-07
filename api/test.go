package test

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/shopspring/decimal"

	"github.com/golang/gddo/httputil/header"
	// "github.com/pickleyd/chainlink/core/logger"
	// "github.com/pickleyd/chainlink/core/testutils"
	"github.com/pickleyd/jobspecviz/pipeline"
)

type Task struct {
	Name    string
	Input   string
	Options map[string]interface{}
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

	fmt.Fprintf(w, "Task: %+v", t)

	ctx := context.Background()

	vars := pipeline.NewVarsFrom(nil)
	task, taskErr := getTask(TaskType(t.Name), t.Options)

	if taskErr != nil {
		// TODO: Define and return different error types
		msg := "Bad request"
		http.Error(w, msg, http.StatusBadRequest)
	}

	result, _ := task.Run(ctx, nil, vars, []pipeline.Result{{Value: "10.23"}})

	fmt.Fprint(w, result.Value.(decimal.Decimal).String())

}

type TaskType string

func (t TaskType) String() string {
	return string(t)
}

const (
	// TaskTypeHTTP             TaskType = "http"
	// TaskTypeBridge           TaskType = "bridge"
	// TaskTypeMean             TaskType = "mean"
	// TaskTypeMedian           TaskType = "median"
	// TaskTypeMode             TaskType = "mode"
	// TaskTypeSum              TaskType = "sum"
	TaskTypeMultiply TaskType = "multiply"
	TaskTypeDivide   TaskType = "divide"
	// TaskTypeJSONParse        TaskType = "jsonparse"
	// TaskTypeCBORParse        TaskType = "cborparse"
	// TaskTypeAny              TaskType = "any"
	// TaskTypeVRF              TaskType = "vrf"
	// TaskTypeVRFV2            TaskType = "vrfv2"
	// TaskTypeEstimateGasLimit TaskType = "estimategaslimit"
	// TaskTypeETHCall          TaskType = "ethcall"
	// TaskTypeETHTx            TaskType = "ethtx"
	// TaskTypeETHABIEncode     TaskType = "ethabiencode"
	// TaskTypeETHABIEncode2    TaskType = "ethabiencode2"
	// TaskTypeETHABIDecode     TaskType = "ethabidecode"
	// TaskTypeETHABIDecodeLog  TaskType = "ethabidecodelog"
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

	for k, v := range options {
		switch c := v.(type) {
		case string:
			fmt.Printf("Item %q is a string, containing %q\n", k, c)
		case float64:
			fmt.Printf("Looks like item %q is a number, specifically %f\n", k, c)
		default:
			fmt.Printf("Not sure what type item %q is, but I think it might be %T\n", k, c)
		}
	}

	// convert map to json
	jsonString, _ := json.Marshal(options)

	// seeing as we're just running a single task with no context
	// or pipeline variables we can just use an empty base task
	baseTask := pipeline.NewBaseTask(0, "", nil, nil, 0)

	var task pipeline.Task
	switch taskType {
	// case TaskTypePanic:
	// 	task = &PanicTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeHTTP:
	// 	task = &HTTPTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeBridge:
	// 	task = &BridgeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeMean:
	// 	task = &MeanTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeMedian:
	// 	task = &MedianTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeMode:
	// 	task = &ModeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeSum:
	// 	task = &SumTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeAny:
	// 	task = &AnyTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeJSONParse:
	// 	task = &JSONParseTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
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
	// case TaskTypeETHABIEncode:
	// 	task = &ETHABIEncodeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeETHABIEncode2:
	// 	task = &ETHABIEncodeTask2{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeETHABIDecode:
	// 	task = &ETHABIDecodeTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeETHABIDecodeLog:
	// 	task = &ETHABIDecodeLogTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
	// case TaskTypeCBORParse:
	// 	task = &CBORParseTask{BaseTask: BaseTask{id: ID, dotID: dotID}}
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
