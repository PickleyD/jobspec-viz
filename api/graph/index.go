package varhelper

import (
	"fmt"
	"log"
	"net/http"

	"github.com/pickleyd/chainlink/core/services/pipeline"
	"github.com/pickleyd/jobspecviz/middleware"
)

type Input struct {
	Spec string
}

type TaskDependency struct {
	Id              string `json:"id"`
	PropagateResult bool   `json:"propagateResult"`
}

type Task struct {
	Id     string           `json:"id"`
	Inputs []TaskDependency `json:"inputs"`
}

type Response struct {
	Tasks []Task `json:"tasks"`
	Error string `json:"error"`
}

func Handler(w http.ResponseWriter, r *http.Request) {

	var input = middleware.ProcessRequestAndTryDecode[Input](w, r)

	parsed, err := pipeline.Parse(input.Spec)

	if err != nil {
		fmt.Printf("%v", err)
	}

	taskArr := []Task{}

	if parsed != nil {
		for _, element := range parsed.Tasks {
			task := Task{
				Id:     element.DotID(),
				Inputs: []TaskDependency{},
			}
			for _, input := range element.Inputs() {
				task.Inputs = append(task.Inputs, TaskDependency{
					Id:              input.InputTask.DotID(),
					PropagateResult: input.PropagateResult,
				})
			}
			taskArr = append(taskArr, task)
		}
	}

	response := Response{
		Tasks: taskArr,
		Error: err.Error(),
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
