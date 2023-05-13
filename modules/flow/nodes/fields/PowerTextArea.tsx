import { useSelector } from "@xstate/react";
import React, { useContext, useState, useId } from "react";
import { GlobalStateContext } from "../../../../context/GlobalStateContext";
import pipelineVarsData from "../../../../data/jobTypeSpecificPipelineVars.json";
import { JOB_TYPE } from "../../../workspace/workspaceMachine";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Popover, FieldLabel } from "../../../../components";
import { VarSelector } from "./VarSelector";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

export interface PowerTextAreaProps {
  label: string;
  value: { raw: string; rich: string; };
  onChange: (newValue: string, newRichValue: string) => void;
  incomingNodes?: Array<string>;
  ownerNodeCustomId: string,
  placeholder?: string;
  optional?: boolean;
  className?: string;
}

const jobTypeSelector = (state: any) => state.context.type;
const taskCustomIdsSelector = (state: any) => state.context.nodes.tasks.map((task: any) => task.ref.state.context.customId)

const wrapMatch = (match: string) => `<span class="text-secondary">${match}</span>`

const wrapVariables = (input: string) => input.replace(/(?<!>)(?!<)\$\(.*?\)/g, wrapMatch)

const stripSpanTags = (input: string) => input.replaceAll(/(<([^>]+)>)/ig, "");

export const PowerTextArea = ({
  label,
  value = { raw: "", rich: "" },
  onChange,
  incomingNodes,
  ownerNodeCustomId,
  placeholder = "",
  optional = false,
  className = "",
}: PowerTextAreaProps) => {
  const globalServices = useContext(GlobalStateContext)

  const jobType: JOB_TYPE = useSelector(
    globalServices.workspaceService,
    jobTypeSelector
  )

  const tasks = useSelector(
    globalServices.workspaceService,
    taskCustomIdsSelector
  )

  const jobTypeSpecificPipelineVars = pipelineVarsData[jobType];

  const handleItemSelected = (item: string) => {
    const newVal = `${value.raw || ""}$(${item})`
    const richValue = wrapVariables(newVal)
    onChange(newVal, richValue)
  }

  const handleChange = (event: ContentEditableEvent) => {
    const newVal = event.target.value
    onChange(newVal, newVal)
  }

  const handleBlur = (event: any) => {
    const currVal = event.target.innerHTML
    const richValue = wrapVariables(currVal)
    onChange(currVal, richValue)
    setShowRich(true)
  }

  const handleFocus = (event: any) => {
    setShowRich(false)
  }

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (event) => {
    const rawVal = event.clipboardData.getData('Text')
    event.preventDefault()
    document.execCommand("insertText", false, rawVal)
  }

  const [showRich, setShowRich] = useState<boolean>(true)

  const fieldId = useId()

  return (
    <div className={`${className} flex flex-col w-full max-w-xs`}>
      <FieldLabel htmlFor={fieldId} name={label} optional />
      <div className="relative">
        <div className="grid grid-cols-1 grid-rows-1">
          <ContentEditable
            id={fieldId}
            html={value.raw || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onPaste={handlePaste}
            className="row-span-full col-span-full textarea textarea-bordered h-full w-full pr-8"
          />
          <ContentEditable
            html={value.rich || `<div class="text-gray-300">${placeholder}</div>`}
            onChange={() => { }}
            className={`${showRich ? "" : "invisible"} row-span-full col-span-full textarea textarea-bordered pr-8 pointer-events-none`}
          />
        </div>
        <div className="absolute right-1 bottom-1">
          <Popover
            label={(open) => (
              <label
                tabIndex={0}
                className={`focus:border hover:border hover:border-secondary focus:border-secondary bg-background h-6 w-6 min-h-0 btn btn-circle swap swap-rotate ${open ? "swap-active" : ""
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
                taskVariables={tasks.filter((customId: string) => customId !== ownerNodeCustomId) ?? []}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};
