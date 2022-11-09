import { useSelector } from "@xstate/react";
import React, { useContext } from "react";
import { GlobalStateContext } from "../../../../context/GlobalStateContext";
import pipelineVarsData from "../../../../data/jobTypeSpecificPipelineVars.json";
import { JOB_TYPE } from "../../../workspace/workspaceMachine";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Popover } from "../../../../components";
import { VarSelector } from "./VarSelector";

export interface PowerTextArrayFieldProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  incomingNodes: Array<string>;
  placeholder?: string;
  optional?: boolean;
}

const jobTypeSelector = (state: any) => state.context.type;

export const PowerTextArrayField = ({
  label,
  value,
  onChange,
  incomingNodes,
  placeholder = "Enter each item on a new line",
  optional = false,
}: PowerTextArrayFieldProps) => {
  const globalServices = useContext(GlobalStateContext);

  const jobType: JOB_TYPE = useSelector(
    globalServices.workspaceService,
    jobTypeSelector
  );

  const jobTypeSpecificPipelineVars = pipelineVarsData[jobType];

  const handleItemSelected = (item: string) => {
    const newVal = `${value || ""}$(${item})`;
    onChange(`[${newVal.split("\n").join(",")}]`);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(
      event.target.value.length > 0
        ? `[${event.target.value.split("\n").join(",")}]`
        : ""
    );
  };

  return (
    <div className="form-control w-full max-w-xs">
      <label className="label pb-0">
        <span className="label-text">{label}</span>
        {optional && <span className="label-text-alt">(optional)</span>}
      </label>
      <div className="flex items-center gap-1">
        <textarea
          onChange={handleChange}
          placeholder={placeholder}
          value={convertValueToNewlines(value)}
          className="textarea textarea-bordered h-24"
        />
        <Popover
          label={(open) => (
            <label
              tabIndex={0}
              className={`border-gray-700 focus:border fous:border-secondary hover:border hover:border-secondary focus:border-secondary bg-base-100 h-6 w-6 min-h-0 btn btn-circle swap swap-rotate ${
                open ? "swap-active" : ""
              }`}
            >
              <BoltIcon className="swap-off h-4 w-4 text-white" />
              <XMarkIcon className="swap-on h-4 w-4 text-white" />
            </label>
          )}
          content={
            <VarSelector
              onVarSelected={handleItemSelected}
              jobVariables={jobTypeSpecificPipelineVars}
              taskVariables={incomingNodes ?? []}
            />
          }
        />
      </div>
    </div>
  );
};

const convertValueToNewlines = (value: string) => {
  return value ? value.slice(1, -1).split(",").join("\n") : "";
};
