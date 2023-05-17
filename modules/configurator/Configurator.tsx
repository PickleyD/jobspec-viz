import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { CronFields, CronVariableSetters, DirectRequestFields, DirectRequestVariableSetters } from "./jobTypes"
import { JOB_TYPE } from "../workspace/workspaceMachine"
import { Tooltip, FieldLabel } from "../../components";
import { TaskConfigTabs } from "../flow/nodes/fields";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
      <div className="flex items-center justify-start gap-2 mb-4">
        <h4 className="uppercase text-sm font-bold tracking-wider text-muted-foreground">Config</h4>
        <Tooltip className="text-sm text-muted-foreground">
          <p>Chainlink nodes support the execution of a number of job types. Each job type has some unique fields and pipeline variables.</p>
          <p>Here you can select your job's type and the relevant configuration fields will become available.</p>
        </Tooltip>
      </div>

      <FieldLabel name="Chainlink Version" />
      <Select disabled={true} value="v1.11.0">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chainlink Version" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="v1.11.0">v1.11.0</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-3 gap-2 max-w-xl">
        <div className="flex flex-col w-full max-w-xs">
          <FieldLabel name="Name" optional />
          <Input
            disabled={disabled}
            type="text"
            placeholder=""
            value={name}
            onChange={(event) => globalServices.workspaceService.send("SET_NAME", { value: event.target.value })}
          />
        </div>

        <div className="flex flex-col w-full max-w-xs">
          <FieldLabel name="External Job ID" optional />
          <Input
            disabled={disabled}
            type="text"
            placeholder=""
            value={externalJobId}
            onChange={(event) => globalServices.workspaceService.send("SET_EXTERNAL_JOB_ID", { value: event.target.value })}
          />
        </div>

        <div className="flex flex-col w-full max-w-xs">
          <FieldLabel name="Gas Limit" optional />
          <Input
            disabled={disabled}
            type="text"
            placeholder=""
            value={gasLimit}
            onChange={(event) => globalServices.workspaceService.send("SET_GAS_LIMIT", { value: event.target.value })}
          />
        </div>

        <div className="flex flex-col w-full max-w-xs">
          <FieldLabel name="Max. Task Duration" optional />
          <Input
            disabled={disabled}
            type="text"
            placeholder=""
            value={maxTaskDuration}
            onChange={(event) => globalServices.workspaceService.send("SET_MAX_TASK_DURATION", { value: event.target.value })}
          />
        </div>

        <div className="flex flex-col w-full max-w-xs">
          <FieldLabel name="Forwarding Allowed" />
          <Select
            disabled={disabled}
            value={forwardingAllowed.toString()}
            onValueChange={(newValue) => globalServices.workspaceService.send("SET_FORWARDING_ALLOWED", { value: newValue })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-muted p-2 rounded-lg mt-6 max-w-xl">
        <div className="flex flex-col w-full max-w-xs">
          <FieldLabel name="Job Type" />
          <Select
            disabled={disabled}
            value={jobType}
            onValueChange={(newValue) => globalServices.workspaceService.send("SET_JOB_TYPE", { value: newValue })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cron">CRON</SelectItem>
              <SelectItem value="directrequest">Direct Request</SelectItem>
              <SelectItem value="fluxmonitor" disabled>Flux Monitor</SelectItem>
              <SelectItem value="keeper" disabled>Keeper</SelectItem>
              <SelectItem value="offchainreporting" disabled>Off-chain Reporting</SelectItem>
              <SelectItem value="webhook" disabled>Webhook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TaskConfigTabs
          config={
            <div className="flex flex-col gap-2 p-4 bg-background h-full w-full">
              {
                renderJobTypeSpecificFields(jobType)
              }
            </div>
          }
          test={<div className="bg-background p-4 h-full w-full">
            {
              renderJobTypeSpecificVariableSetters(jobType, { disabled })
            }
          </div>}
        />
      </div>
    </div>
  );
};
