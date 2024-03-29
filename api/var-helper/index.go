package varhelper

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strconv"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/pickleyd/chainlink/core/services/pipeline"
	"github.com/pickleyd/jobspecviz/middleware"
	"github.com/shopspring/decimal"
)

type Var struct {
	Value    string
	Values   []string
	Type     string
	FromType string
	Keep     interface{}
}

type Input struct {
	Vars               map[string]Var
	JobRun             map[string]Var
	JobSpec            map[string]Var
	Inputs             []Var
	Want               Var
	WantSideEffectData Var
	MockResponse       Var
}

type Response struct {
	Vars64               string   `json:"vars64"`
	Inputs64             []string `json:"inputs64"`
	Want64               string   `json:"want64"`
	WantSideEffectData64 string   `json:"wantSideEffectData64"`
	MockResponse64       string   `json:"mockResponse64"`
}

func Handler(w http.ResponseWriter, r *http.Request) {

	var i = middleware.ProcessRequestAndTryDecode[Input](w, r)

	// Vars
	varValues := make(map[string]interface{})
	if i.Vars != nil {
		for k, v := range i.Vars {
			varValues[k] = convertBasedOnTypeParam(v)
		}
	}
	// JobRun
	jobRunVars := make(map[string]interface{})
	if i.JobRun != nil {
		for k, v := range i.JobRun {
			jobRunVars[k] = convertBasedOnTypeParam(v)
		}
	}
	varValues["jobRun"] = jobRunVars
	// JobSpec
	jobSpecVars := make(map[string]interface{})
	if i.JobSpec != nil {
		for k, v := range i.JobSpec {
			jobSpecVars[k] = convertBasedOnTypeParam(v)
		}
	}
	varValues["jobSpec"] = jobSpecVars

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
	if i.Want.Value != "" || i.Want.Values != nil || i.Want.Keep != nil {
		wantBase64 = customToBase64(convertBasedOnTypeParam(i.Want))
	}

	// Want Side Effect
	wantSideEffectDataBase64 := ""
	if i.WantSideEffectData.Value != "" || i.WantSideEffectData.Values != nil || i.WantSideEffectData.Keep != nil {
		wantSideEffectDataBase64 = customToBase64(convertBasedOnTypeParam(i.WantSideEffectData))
	}

	// Mock Response
	mockResponseBase64 := ""
	if i.MockResponse.Value != "" || i.MockResponse.Values != nil || i.MockResponse.Keep != nil {
		mockResponseBase64 = customToBase64(convertBasedOnTypeParam(i.MockResponse))
	}

	response := Response{
		Vars64:               varsBase64,
		Inputs64:             inputsBase64,
		Want64:               wantBase64,
		WantSideEffectData64: wantSideEffectDataBase64,
		MockResponse64:       mockResponseBase64,
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
	} else if v.Type == "string" {
		if v.Value != "" {
			return v.Value
		} else if len(v.Values) > 0 {
			return v.Values
		}
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
			return toBytes(v.Value, v.FromType)
		} else if len(v.Values) > 0 {
			var s [][]byte
			for _, val := range v.Values {
				s = append(s, toBytes(val, v.FromType))
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

func toBytes(s string, fromType string) []byte {
	if fromType == "hex" {
		return hexutil.MustDecode(s)
	}
	return []byte(s)
}
