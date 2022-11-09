import { useSelector } from "@xstate/react";
import React, { useContext } from "react";
import { GlobalStateContext } from "../../../../context/GlobalStateContext";
import pipelineVarsData from "../../../../data/jobTypeSpecificPipelineVars.json";
import { JOB_TYPE } from "../../../workspace/workspaceMachine";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Popover } from "../../../../components";
import { VarSelector } from "./VarSelector";

export interface PowerTextAreaProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  incomingNodes: Array<string>;
  placeholder?: string;
  optional?: boolean;
  className?: string;
}

const jobTypeSelector = (state: any) => state.context.type;

export const PowerTextArea = ({
  label,
  value,
  onChange,
  incomingNodes,
  placeholder = "",
  optional = false,
  className = "",
}: PowerTextAreaProps) => {
  const globalServices = useContext(GlobalStateContext);

  const jobType: JOB_TYPE = useSelector(
    globalServices.workspaceService,
    jobTypeSelector
  );

  const jobTypeSpecificPipelineVars = pipelineVarsData[jobType];

  const handleItemSelected = (item: string) => {
    onChange(`${value || ""}$(${item})`);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const items = [...jobTypeSpecificPipelineVars, ...(incomingNodes ?? [])];

  return (
    <div className={`${className} form-control w-full max-w-xs`}>
      <label className="label pb-0">
        <span className="label-text">{label}</span>
        {optional && <span className="label-text-alt">(optional)</span>}
      </label>
      <div className="flex items-center gap-1">
        <textarea
          onChange={handleChange}
          placeholder={placeholder}
          value={value}
          className="textarea textarea-bordered h-full"
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
