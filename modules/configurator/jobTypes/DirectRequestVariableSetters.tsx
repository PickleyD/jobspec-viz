import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"
import { TextArrayField, TextArea } from "../../flow/nodes/fields";

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
        <div className="grid grid-cols-2 grid-flow-row gap-3">
            <div className="w-[410px]">
                <TextArrayField
                    label="$(jobRun.logTopics)"
                    value={logTopics}
                    placeholder="Enter each topic as a hex-encoded bytes32 on a new line"
                    onChange={(newValue) => globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_VARIABLES", { jobType: "directrequest", variable: "logTopics", value: newValue })}
                    onChangeAsArray={(newArray) => globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_VARIABLES", { jobType: "directrequest", variable: "logTopics", values: newArray })}
                />
            </div>
            <TextArea
                disabled={disabled}
                label="$(jobRun.logData)"
                placeholder=""
                displayJsonValidity={false}
                value={logData}
                onChange={(newValue) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_VARIABLES", { jobType: "directrequest", variable: "logData", value: newValue }))}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.meta)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.logBlockHash)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.logBlockNumber)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.logTxHash)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.logAddress)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.blockReceiptsRoot)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.blockTransactionsRoot)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
            <TextArea
                disabled={true}
                label="$(jobRun.blockStateRoot)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
        </div>
    </>
}