import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"
import { TextArrayField } from "../../flow/nodes/fields";

const logTopicsSelector = (state: any) => state.context.jobTypeVariables.directrequest.logTopics.value;
const logDataSelector = (state: any) => state.context.jobTypeVariables.directrequest.logData.value;

export interface DirectRequestVariableSettersProps {
    className?: string;
    disabled?: boolean;
}

export const DirectRequestVariableSetters = ({ className = "", disabled = false }: DirectRequestVariableSettersProps) => {

    const globalServices = useContext(GlobalStateContext);

    const logTopics = useSelector(
        globalServices.workspaceService,
        logTopicsSelector
    )

    const logData = useSelector(
        globalServices.workspaceService,
        logDataSelector
    )

    return <>
        <TextArrayField
            label="$(jobRun.logTopics)"
            value={logTopics}
            placeholder="Enter each topic as a hex-encoded bytes32 on a new line"
            onChange={(newValue) => globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_VARIABLES", { jobType: "directrequest", variable: "logTopics", value: newValue })}
            onChangeAsArray={(newArray) => globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_VARIABLES", { jobType: "directrequest", variable: "logTopics", values: newArray })}
        />
        <div className={`${className} form-control w-60`}>
            <label className="label">
                <span className="label-text text-xs">$(jobRun.logData)</span>
            </label>
            <input
                disabled={disabled}
                type="text"
                placeholder="Type here"
                className="input input-bordered input-sm w-full max-w-xs"
                value={logData}
                onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_VARIABLES", { jobType: "directrequest", variable: "logData", value: event.target.value }))}
            />
        </div>
    </>
}