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

type Task struct {
	Id     string   `json:"id"`
	Inputs []string `json:"inputs"`
}

type Response struct {
	Tasks []Task `json:"tasks"`
}

func Handler(w http.ResponseWriter, r *http.Request) {

	var input = middleware.ProcessRequestAndTryDecode[Input](w, r)

	parsed, err := pipeline.Parse(input.Spec)

	if err != nil {
		fmt.Fprintf(w, "%v", err)
	}

	taskArr := []Task{}

	for _, element := range parsed.Tasks {
		task := Task{
			Id:     element.DotID(),
			Inputs: []string{},
		}
		for _, input := range element.Inputs() {
			task.Inputs = append(task.Inputs, input.InputTask.DotID())
		}
		taskArr = append(taskArr, task)
	}

	response := Response{
		Tasks: taskArr,
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
