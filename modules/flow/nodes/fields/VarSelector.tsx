import { VarChip } from "./VarChip";

export type VarSelectorProps = {
    onVarSelected: (variable: string) => void;
    jobVariables: Array<string>;
    taskVariables: Array<string>;
};

export const VarSelector = ({ onVarSelected, jobVariables, taskVariables }: VarSelectorProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 w-96">
      <section className="flex flex-col align-start gap-2">
        <p className="whitespace-nowrap text-xs underline text-gray-400">
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
        <p className="whitespace-nowrap text-xs underline text-gray-400">
          Task-level
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
          {taskVariables.length === 0 && <p className="text-xs italic">No preceding tasks connected</p>}
        </div>
      </section>
    </div>
  );
};