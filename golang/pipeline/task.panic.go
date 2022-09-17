package pipeline

import (
	"context"

	"github.com/pickleyd/jobspecviz/golang/logger"
)

type PanicTask struct {
	BaseTask `mapstructure:",squash"`
	Msg      string
}

var _ Task = (*PanicTask)(nil)

func (t *PanicTask) Type() TaskType {
	return TaskTypePanic
}

func (t *PanicTask) Run(_ context.Context, _ logger.Logger, vars Vars, _ []Result) (result Result, runInfo RunInfo) {
	panic(t.Msg)
}
