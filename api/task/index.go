package task

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/pickleyd/chainlink/core/config"
	"github.com/pickleyd/chainlink/core/logger"
	"github.com/pickleyd/chainlink/core/services/pipeline"
	"github.com/pickleyd/jobspecviz/middleware"
)

type Task struct {
	Id   string
	Name string
	// Inputs  []interface{}
	Inputs64     []string
	Options      map[string]interface{}
	Vars64       string
	MockResponse interface{}
}

type Response struct {
	Value  string                 `json:"value"`
	Val64  string                 `json:"val64"`
	Vars   map[string]interface{} `json:"vars"`
	Vars64 string                 `json:"vars64"`
	Error  string                 `json:"error"`
}

func Handler(w http.ResponseWriter, r *http.Request) {

	var t = middleware.ProcessRequestAndTryDecode[Task](w, r)

	ctx := context.Background()

	vars := make(map[string]interface{})

	if t.Vars64 != "" {
		varsDec, _ := base64.StdEncoding.DecodeString(t.Vars64)

		inputVars := pipeline.JSONSerializable{}
		inputVars.UnmarshalJSON(varsDec)

		vars = inputVars.Val.(map[string]interface{})
	}

	response := Response{}

	if t.MockResponse != nil {
		vars[t.Id] = t.MockResponse

		varsEnc := customToBase64(vars)

		response = Response{
			Value:  fmt.Sprintf("%v", t.MockResponse),
			Val64:  customToBase64(t.MockResponse),
			Vars:   vars,
			Vars64: varsEnc,
			Error:  "",
		}
	} else {
		pipelineVars := pipeline.NewVarsFrom(vars)

		task, taskErr := getTask(TaskType(t.Name), t.Options)

		if taskErr != nil {
			// TODO: Define and return different error types
			msg := "Bad request"
			http.Error(w, msg, http.StatusBadRequest)
		}

		inputs := make([]pipeline.Result, 0, len(t.Inputs64))
		for _, r := range t.Inputs64 {
			inputsDec, _ := base64.StdEncoding.DecodeString(r)

			inputsTemp := pipeline.JSONSerializable{}
			inputsTemp.UnmarshalJSON(inputsDec)

			inputs = append(inputs, pipeline.Result{Value: inputsTemp.Val})
		}

		result, _ := task.Run(ctx, logger.NullLogger, pipelineVars, inputs)

		// Append the result to the vars
		// TODO - existence check and warning for overwrite?
		vars[t.Id] = result.Value

		varsEnc := customToBase64(vars)
		resultValEnc := customToBase64(result.Value)

		resultErr := ""
		if result.Error != nil {
			resultErr = result.Error.Error()
		}

		response = Response{
			Value:  fmt.Sprintf("%v", result.Value),
			Val64:  resultValEnc,
			Vars:   vars,
			Vars64: varsEnc,
			Error:  resultErr,
		}
	}

	jsonSer := pipeline.JSONSerializable{
		Valid: true,
		Val:   response,
	}

	jData, errJson := jsonSer.MarshalJSON()
	if errJson != nil {
		log.Fatal("Error marshalling response object to json", errJson)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jData)

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
	TaskTypeETHTx        TaskType = "ethtx"
	TaskTypeETHABIEncode TaskType = "ethabiencode"
	// TaskTypeETHABIEncode2    TaskType = "ethabiencode2"
	TaskTypeETHABIDecode    TaskType = "ethabidecode"
	TaskTypeETHABIDecodeLog TaskType = "ethabidecodelog"
	TaskTypeMerge           TaskType = "merge"
	TaskTypeLowercase       TaskType = "lowercase"
	TaskTypeUppercase       TaskType = "uppercase"
	TaskTypeConditional     TaskType = "conditional"
	TaskTypeHexDecode       TaskType = "hexdecode"
	TaskTypeHexEncode       TaskType = "hexencode"
	TaskTypeBase64Decode    TaskType = "base64decode"
	TaskTypeBase64Encode    TaskType = "base64encode"
	TaskTypeLessThan        TaskType = "lessthan"
	TaskTypeLength          TaskType = "length"
	// // Testing only.
	// TaskTypePanic TaskType = "panic"
	// TaskTypeMemo  TaskType = "memo"
	// TaskTypeFail  TaskType = "fail"
)

func getTask(taskType TaskType, options map[string]interface{}) (pipeline.Task, error) {

	// convert map to json
	jsonString, _ := json.Marshal(options)

	// seeing as we're just running a single task with no context
	// we can just use an empty base task
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
	case TaskTypeETHTx:
		var opts pipeline.ETHTxTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.ETHTxTask{
			BaseTask:         baseTask,
			From:             opts.From,
			To:               opts.To,
			Data:             opts.Data,
			GasLimit:         opts.GasLimit,
			TxMeta:           opts.TxMeta,
			MinConfirmations: opts.MinConfirmations,
			FailOnRevert:     opts.FailOnRevert,
			EVMChainID:       opts.EVMChainID,
			TransmitChecker:  opts.TransmitChecker,
		}
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
	case TaskTypeMerge:
		var opts pipeline.MergeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.MergeTask{
			BaseTask: baseTask,
			Left:     opts.Left,
			Right:    opts.Right,
		}
	case TaskTypeLowercase:
		var opts pipeline.LowercaseTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.LowercaseTask{
			BaseTask: baseTask,
			Input:    opts.Input,
		}
	case TaskTypeUppercase:
		var opts pipeline.UppercaseTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.UppercaseTask{
			BaseTask: baseTask,
			Input:    opts.Input,
		}
	case TaskTypeConditional:
		var opts pipeline.ConditionalTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.ConditionalTask{
			BaseTask: baseTask,
			Data:     opts.Data,
		}
	case TaskTypeHexEncode:
		var opts pipeline.HexEncodeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.HexEncodeTask{
			BaseTask: baseTask,
			Input:    opts.Input,
		}
	case TaskTypeHexDecode:
		var opts pipeline.HexDecodeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.HexDecodeTask{
			BaseTask: baseTask,
			Input:    opts.Input,
		}
	case TaskTypeBase64Encode:
		var opts pipeline.Base64EncodeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.Base64EncodeTask{
			BaseTask: baseTask,
			Input:    opts.Input,
		}
	case TaskTypeBase64Decode:
		var opts pipeline.Base64DecodeTask
		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.Base64DecodeTask{
			BaseTask: baseTask,
			Input:    opts.Input,
		}
	case TaskTypeLessThan:
		var opts pipeline.LessThanTask

		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.LessThanTask{
			BaseTask: baseTask,
			Left:     opts.Left,
			Right:    opts.Right,
		}
	case TaskTypeLength:
		var opts pipeline.LengthTask

		if err := json.Unmarshal(jsonString, &opts); err != nil {
			log.Fatal(err)
		}

		task = &pipeline.LengthTask{
			BaseTask: baseTask,
			Input:    opts.Input,
		}
	default:
		return nil, fmt.Errorf(`unknown task type: "%v"`, taskType)
	}

	return task, nil
}
