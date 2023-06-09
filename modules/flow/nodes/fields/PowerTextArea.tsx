import { useSelector } from "@xstate/react";
import React, { useContext, useState, useId } from "react";
import { GlobalStateContext } from "../../../../context/GlobalStateContext";
import pipelineVarsData from "../../../../data/jobTypeSpecificPipelineVars.json";
import { JOB_TYPE } from "../../../workspace/workspaceMachine";
import { BoltIcon } from "@heroicons/react/24/outline";
import { FieldLabel } from "../../../../components";
import { VarSelector } from "./VarSelector";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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

  const textAreaClasses = 'h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

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
            className={`${textAreaClasses} row-span-full col-span-full h-full w-full pr-8`}
          />
          <ContentEditable
            html={value.rich || `<div class="text-muted-foreground">${placeholder}</div>`}
            onChange={() => { }}
            className={`${textAreaClasses} ${showRich ? "" : "invisible"} h-full row-span-full col-span-full pr-8 pointer-events-none`}
          />
        </div>
        <div className="absolute right-1 bottom-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-6 h-6 rounded-full p-0 group transition-colors hover:bg-foreground">
                <BoltIcon className="h-4 w-4 group-hover:stroke-background" />
                <span className="sr-only">Open variables picker</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-fit">
              <VarSelector
                onVarSelected={handleItemSelected}
                jobVariables={jobTypeSpecificPipelineVars}
                taskVariables={tasks.filter((customId: string) => customId !== ownerNodeCustomId) ?? []}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
