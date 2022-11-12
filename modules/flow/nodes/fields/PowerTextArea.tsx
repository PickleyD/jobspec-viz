import { useSelector } from "@xstate/react";
import React, { useContext } from "react";
import { GlobalStateContext } from "../../../../context/GlobalStateContext";
import pipelineVarsData from "../../../../data/jobTypeSpecificPipelineVars.json";
import { JOB_TYPE } from "../../../workspace/workspaceMachine";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Popover } from "../../../../components";
import { VarSelector } from "./VarSelector";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

export interface PowerTextAreaProps {
  label: string;
  value: { raw: string; rich: string; };
  onChange: (newValue: string, newRichValue: string) => void;
  incomingNodes: Array<string>;
  placeholder?: string;
  optional?: boolean;
  className?: string;
}

const jobTypeSelector = (state: any) => state.context.type;

export const PowerTextArea = ({
  label,
  value = {raw: "", rich: ""},
  onChange,
  incomingNodes,
  placeholder = "",
  optional = false,
  className = "",
}: PowerTextAreaProps) => {
  const globalServices = useContext(GlobalStateContext)

  const jobType: JOB_TYPE = useSelector(
    globalServices.workspaceService,
    jobTypeSelector
  )

  const jobTypeSpecificPipelineVars = pipelineVarsData[jobType];

  const handleItemSelected = (item: string) => {
    const newVal = `${value || ""}$(${item})`
    onChange(newVal, newVal)
  }

  const handleChange = (event: ContentEditableEvent) => {
    const newVal = event.target.value
    onChange(newVal, newVal)
  }

  return (
    <div className={`${className} form-control w-full max-w-xs`}>
      <label className="label pb-0">
        <span className="label-text">{label}</span>
        {optional && <span className="label-text-alt">(optional)</span>}
      </label>
      <div className="relative">
        {/* <textarea
          onChange={handleChange}
          placeholder={placeholder}
          value={value}
          className="textarea textarea-bordered h-full"
        /> */}
        <ContentEditable
          html={value.rich || ""}
          onChange={handleChange}
          className="textarea textarea-bordered h-full pr-8"
        />
        <div className="absolute right-1 bottom-1">
          <Popover
            label={(open) => (
              <label
                tabIndex={0}
                className={`border-gray-700 focus:border hover:border hover:border-secondary focus:border-secondary bg-base-100 h-6 w-6 min-h-0 btn btn-circle swap swap-rotate ${open ? "swap-active" : ""
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
    </div>
  );
};
