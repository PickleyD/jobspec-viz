import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { CronFields, CronVariableSetters, DirectRequestFields, DirectRequestVariableSetters } from "./jobTypes"
import { JOB_TYPE } from "../workspace/workspaceMachine"
import { Tooltip, FieldLabel } from "../../components";
import { TaskConfigTabs } from "../flow/nodes/fields";

const jobTypeSelector = (state: any) => state.context.type;
const nameSelector = (state: any) => state.context.name;
const externalJobIdSelector = (state: any) => state.context.externalJobId;
const gasLimitSelector = (state: any) => state.context.gasLimit;
const maxTaskDurationSelector = (state: any) => state.context.maxTaskDuration;
const forwardingAllowedSelector = (state: any) => state.context.forwardingAllowed;
const testModeSelector = (state: any) => state.matches("testMode") || state.matches("testModeLoading")

const renderJobTypeSpecificFields = (jobType: JOB_TYPE) => {
    switch (jobType) {
        case "cron":
            return <CronFields />
        case "directrequest":
            return <DirectRequestFields />
        default:
            return null
    }
}

const renderJobTypeSpecificVariableSetters = (jobType: JOB_TYPE, props: any) => {
    switch (jobType) {
        case "cron":
            return <CronVariableSetters />
        case "directrequest":
            return <DirectRequestVariableSetters {...props} />
        default:
            return null
    }
}

export const Configurator = () => {
    const globalServices = useContext(GlobalStateContext);

    const jobType = useSelector(
        globalServices.workspaceService,
        jobTypeSelector
    )
    const name = useSelector(
        globalServices.workspaceService,
        nameSelector
    )
    const externalJobId = useSelector(
        globalServices.workspaceService,
        externalJobIdSelector
    )
    const gasLimit = useSelector(
        globalServices.workspaceService,
        gasLimitSelector
    )
    const maxTaskDuration = useSelector(
        globalServices.workspaceService,
        maxTaskDurationSelector
    )
    const forwardingAllowed = useSelector(
        globalServices.workspaceService,
        forwardingAllowedSelector
    )

    const testMode = useSelector(
        globalServices.workspaceService,
        testModeSelector
    )

    const disabled = testMode

    return (
        <div className="">
            <div className="flex items-center justify-start gap-2">
                <div className="text-left text-base uppercase underline underline-offset-4 py-1 w-fit font-bold tracking-widest">
                    Config
                </div>
                <Tooltip className="text-sm text-gray-300">
                    <p>Chainlink nodes support the execution of a number of job types. Each job type has some unique fields and pipeline variables.</p>
                    <p>Here you can select your job's type and the relevant configuration fields will become available.</p>
                </Tooltip>
            </div>

            <div className="form-control w-full max-w-xs">
                <FieldLabel name="Chainlink Version" />
                <select
                    disabled={true}
                    className="select select-bordered select-sm"
                    defaultValue="v1.11.0"
                    onChange={() => { }}
                >
                    <option value="v1.11.0">v1.11.0</option>
                </select>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-xl">
                <div className="form-control w-full max-w-xs">
                    <FieldLabel name="Name" optional />
                    <input
                        disabled={disabled}
                        type="text"
                        placeholder=""
                        className="input input-bordered input-sm w-full max-w-xs"
                        value={name}
                        onChange={(event) => globalServices.workspaceService.send("SET_NAME", { value: event.target.value })}
                    />
                </div>

                <div className="form-control w-full max-w-xs">
                    <FieldLabel name="External Job ID" optional />
                    <input
                        disabled={disabled}
                        type="text"
                        placeholder=""
                        className="input input-bordered input-sm w-full max-w-xs"
                        value={externalJobId}
                        onChange={(event) => globalServices.workspaceService.send("SET_EXTERNAL_JOB_ID", { value: event.target.value })}
                    />
                </div>

                <div className="form-control w-full max-w-xs">
                    <FieldLabel name="Gas Limit" optional />
                    <input
                        disabled={disabled}
                        type="text"
                        placeholder=""
                        className="input input-bordered input-sm w-full max-w-xs"
                        value={gasLimit}
                        onChange={(event) => globalServices.workspaceService.send("SET_GAS_LIMIT", { value: event.target.value })}
                    />
                </div>

                <div className="form-control w-full max-w-xs">
                    <FieldLabel name="Max. Task Duration" optional />
                    <input
                        disabled={disabled}
                        type="text"
                        placeholder=""
                        className="input input-bordered input-sm w-full max-w-xs"
                        value={maxTaskDuration}
                        onChange={(event) => globalServices.workspaceService.send("SET_MAX_TASK_DURATION", { value: event.target.value })}
                    />
                </div>

                <div className="form-control w-full max-w-xs">
                    <FieldLabel name="Forwarding Allowed" />
                    <select
                        className="select select-bordered select-sm"
                        value={forwardingAllowed}
                        onChange={(event) => globalServices.workspaceService.send("SET_FORWARDING_ALLOWED", { value: event.target.value })}
                    >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>
            </div>

            <div className="bg-base-300 p-2 rounded-lg mt-6 max-w-xl">
                <div className="form-control w-full max-w-xs">
                    <FieldLabel name="Job Type" />
                    <select
                        disabled={disabled}
                        className="select select-bordered select-sm"
                        value={jobType}
                        onChange={(event) => globalServices.workspaceService.send("SET_JOB_TYPE", { value: event.target.value })}
                    >
                        <option value="cron">CRON</option>
                        <option value="directrequest">Direct Request</option>
                        <option value="fluxmonitor" disabled>Flux Monitor</option>
                        <option value="keeper" disabled>Keeper</option>
                        <option value="offchainreporting" disabled>Off-chain Reporting</option>
                        <option value="webhook" disabled>Webhook</option>
                    </select>
                </div>

                <TaskConfigTabs
                    config={
                        <div className="flex flex-col gap-2 p-4 bg-base-100 h-full w-full">
                            {
                                renderJobTypeSpecificFields(jobType)
                            }
                        </div>
                    }
                    test={<div className="bg-base-100 p-4 h-full w-full">
                        {
                            renderJobTypeSpecificVariableSetters(jobType, { disabled })
                        }
                    </div>}
                />
            </div>
        </div>
    );
};
