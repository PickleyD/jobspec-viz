package varhelper

import (
	"fmt"
	"net/http"

	"github.com/pickleyd/chainlink/core/services/pipeline"
	"github.com/pickleyd/jobspecviz/middleware"
)

type Input struct {
	Spec string
}

type Response struct {
	Result string
}

func Handler(w http.ResponseWriter, r *http.Request) {

	var input = middleware.ProcessRequestAndTryDecode[Input](w, r)

	parsed, err := pipeline.Parse(input.Spec)

	if err != nil {
		fmt.Fprintf(w, "%v", err)
	}

	for _, element := range parsed.Tasks {
		fmt.Fprintf(w, "\n%v: ", element.DotID())
		for _, input := range element.Inputs() {
			fmt.Fprintf(w, "%v, ", input.InputTask.DotID())
		}
	}
}
