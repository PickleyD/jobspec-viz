package pipeline_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/pickleyd/chainlink/core/logger"
	"github.com/pickleyd/chainlink/core/services/pipeline"
	"github.com/pickleyd/chainlink/core/testutils"
)

func TestUppercaseTask(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		input interface{}
		want  string
	}{
		{"uppercase string", "UPPERCASE", "UPPERCASE"},
		{"camelCase string", "camelCase", "CAMELCASE"},
		{"PascalCase string", "PascalCase", "PASCALCASE"},
		{"mixed string", "mIxEd", "MIXED"},
		{"lowercase string", "lowercase", "LOWERCASE"},
		{"empty string", "", ""},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Run("without vars", func(t *testing.T) {
				vars := pipeline.NewVarsFrom(nil)
				task := pipeline.UppercaseTask{BaseTask: pipeline.NewBaseTask(0, "task", nil, nil, 0), Input: test.input.(string)}
				result, runInfo := task.Run(testutils.Context(t), logger.TestLogger(t), vars, []pipeline.Result{{Value: test.input}})

				assert.False(t, runInfo.IsPending)
				assert.False(t, runInfo.IsRetryable)
				require.NoError(t, result.Error)
				require.Equal(t, test.want, result.Value.(string))
			})
			t.Run("with vars", func(t *testing.T) {
				vars := pipeline.NewVarsFrom(map[string]interface{}{
					"foo": map[string]interface{}{"bar": test.input},
				})
				task := pipeline.UppercaseTask{
					BaseTask: pipeline.NewBaseTask(0, "task", nil, nil, 0),
					Input:    "$(foo.bar)",
				}
				result, runInfo := task.Run(testutils.Context(t), logger.TestLogger(t), vars, []pipeline.Result{})
				assert.False(t, runInfo.IsPending)
				assert.False(t, runInfo.IsRetryable)
				require.NoError(t, result.Error)
				require.Equal(t, test.want, result.Value.(string))
			})
		})
	}
}