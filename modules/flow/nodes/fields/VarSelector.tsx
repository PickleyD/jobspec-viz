import { VarChip } from "./VarChip";

export type VarSelectorProps = {
    onVarSelected: (variable: string) => void;
    jobVariables: Array<string>;
    taskVariables: Array<string>;
};

export const VarSelector = ({ onVarSelected, jobVariables, taskVariables }: VarSelectorProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 w-fit max-w-xs">
      <section className="flex flex-col align-start gap-2">
        <p className="whitespace-nowrap text-xs underline text-muted-foreground">
          Job-level
        </p>
        <div className="flex flex-row flex-wrap gap-1">
          {jobVariables.map((variable, varIndex) => (
            <VarChip
              onClick={() => onVarSelected(variable)}
              key={`job_var_${varIndex}`}
            >
              {variable}
            </VarChip>
          ))}
        </div>
      </section>
      <section className="flex flex-col align-start gap-2">
        <p className="whitespace-nowrap text-xs underline text-muted-foreground">
          Other tasks
        </p>
        <div className="flex flex-row flex-wrap gap-1">
          {taskVariables.map((variable, varIndex) => (
            <VarChip
              onClick={() => onVarSelected(variable)}
              key={`task_var_${varIndex}`}
            >
              {variable}
            </VarChip>
          ))}
          {taskVariables.length === 0 && <p className="text-xs italic">No other tasks</p>}
        </div>
      </section>
    </div>
  );
};
