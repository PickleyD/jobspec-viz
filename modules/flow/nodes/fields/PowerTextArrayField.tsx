import { useSelector } from "@xstate/react";
import React from "react";
import { GlobalStateContext } from "../../../../context/GlobalStateContext";
import { useContext } from "react";
import pipelineVarsData from "../../../../data/jobTypeSpecificPipelineVars.json"
import { JOB_TYPE } from "../../../workspace/workspaceMachine";

export interface PowerTextArrayFieldProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    incomingNodes: Array<string>;
    placeholder?: string;
    optional?: boolean;
}

const jobTypeSelector = (state: any) => state.context.type

export const PowerTextArrayField = ({
    label,
    value,
    onChange,
    incomingNodes,
    placeholder = "Enter each item on a new line",
    optional = false
}: PowerTextArrayFieldProps) => {

    const globalServices = useContext(GlobalStateContext);

    const jobType: JOB_TYPE = useSelector(
        globalServices.workspaceService,
        jobTypeSelector
    )

    const jobTypeSpecificPipelineVars = pipelineVarsData[jobType]

    const handleItemSelected = (item: string) => {
        const newVal = `${value || ""}$(${item})`
        onChange(`[${newVal.split('\n').join(",")}]`)
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value.length > 0 ? `[${event.target.value.split('\n').join(",")}]` : "")
    }

    const items = [
        ...jobTypeSpecificPipelineVars,
        ...(incomingNodes ?? [])
    ]

    return <div className="form-control w-full max-w-xs">
        <label className="label pb-0">
            <span className="label-text">{label}</span>
            {
                optional && <span className="label-text-alt">(optional)</span>
            }
        </label>
        <div className="flex items-center gap-1">
            <textarea
                onChange={handleChange}
                placeholder={placeholder}
                value={convertValueToNewlines(value)}
                className="textarea textarea-bordered h-24"
            />
            <div className="dropdown">
                <label tabIndex={0} className="m-1">
                    <button className="btn btn-circle btn-outline h-8 w-8 min-h-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </button>
                </label>
                <ul tabIndex={0} className="border dropdown-content menu p-2 shadow bg-base-100 rounded w-52">
                    {
                        items && items.length > 0 ?
                        items.map((item: string, index: number) => <li key={index} className="text-xs"><a onClick={() => handleItemSelected(item)}>{item}</a></li>)
                            :
                            <li className="text-xs">No incoming tasks connected or job type specific pipeline variables available</li>
                    }
                </ul>
            </div>
        </div>
    </div>
}

const convertValueToNewlines = (value: string) => {
    return value ? value.slice(1, -1).split(",").join("\n") : ""
}