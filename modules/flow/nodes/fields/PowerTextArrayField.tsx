import { useSelector } from "@xstate/react";
import React, { useContext, useId, useState } from "react";
import { GlobalStateContext } from "../../../../context/GlobalStateContext";
import pipelineVarsData from "../../../../data/jobTypeSpecificPipelineVars.json";
import { JOB_TYPE } from "../../../workspace/workspaceMachine";
import { BoltIcon } from "@heroicons/react/24/outline";
import { FieldLabel } from "../../../../components";
import { VarSelector } from "./VarSelector";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface PowerTextArrayFieldProps {
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

const wrapVariables = (input: string) => input.replace(/(\$\(.*?\))(?!^>*>|[^<>]*<\/span)/g, wrapMatch)

const stripSpanTags = (input: string) => input.replaceAll(/<\/*span[^>]*>/ig, "");

export const PowerTextArrayField = ({
    label,
    value = { raw: "", rich: "" },
    onChange,
    incomingNodes,
    ownerNodeCustomId,
    placeholder = "Enter each item on a new line",
    optional = false,
    className = "",
}: PowerTextArrayFieldProps) => {
    const globalServices = useContext(GlobalStateContext);

    const jobType: JOB_TYPE = useSelector(
        globalServices.workspaceService,
        jobTypeSelector
    );

    const tasks = useSelector(
        globalServices.workspaceService,
        taskCustomIdsSelector
    )

    const jobTypeSpecificPipelineVars = pipelineVarsData[jobType];

    const handleItemSelected = (item: string) => {
        const newVal = `${value.raw.slice(1, -1) || ""}$(${item})`
        const asArrayVal = convertNewLinesToArrayValue(newVal)
        const richValue = wrapVariables(convertArrayValueToNewlines(`[${newVal}]`))
        onChange(asArrayVal, richValue)
    };

    const handleChange = (event: ContentEditableEvent) => {
        const newVal = event.target.value
        const asArrayVal = convertNewLinesToArrayValue(newVal)
        onChange(
            newVal.length > 0
                ? asArrayVal
                : "",
            event.target.value
        )
    }

    const handleBlur = (event: any) => {
        const currVal = event.target.innerHTML
        const richValue = wrapVariables(currVal)
        onChange(convertNewLinesToArrayValue(currVal), richValue)
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

    const fieldId = useId()

    const [showRich, setShowRich] = useState<boolean>(true)

  const textAreaClasses = 'h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

    return (
        <div className={`${className} flex flex-col w-full max-w-xs`}>
            <FieldLabel htmlFor={fieldId} name={label} optional />
            <div className="relative">
                <div className="grid grid-cols-1 grid-rows-1">
                    <ContentEditable
                        id={fieldId}
                        html={convertArrayValueToNewlines(value.raw) || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        onPaste={handlePaste}
                        className={`${textAreaClasses} row-span-full col-span-full h-full whitespace-nowrap overflow-auto`}
                    />
                    <ContentEditable
                        html={value.rich || `<div class="text-muted-foreground">${placeholder}</div>`}
                        onChange={() => { }}
                        className={`${textAreaClasses} ${showRich ? "" : "invisible"} row-span-full col-span-full whitespace-nowrap overflow-auto textarea textarea-bordered absolute top-0 bottom-0 right-0 left-0 pr-8 pointer-events-none`}
                    />
                    {/* <ContentEditable
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
                    /> */}
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

const convertArrayValueToNewlines = (value: string) => {
    return value ? value.slice(1, -1).split(",").map((val, index) => index === 0 ? val : `<div>${val}</div>`).join("").replaceAll("<div></div>", "<div><br></div>") : "";
};

const convertNewLinesToArrayValue = (value: string) => {
    return value ? `[${value.replaceAll("<div>", ",").replaceAll("</div>", "").replaceAll("<br>", "")}]` : ""
}