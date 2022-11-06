import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"

const logTopicsSelector = (state: any) => state.context.jobTypeVariables.directRequest.logTopics.value;

export interface DirectRequestVariableSettersProps {
  className?: string;
}

export const DirectRequestVariableSetters = ({ className = "" }: DirectRequestVariableSettersProps) => {

  const globalServices = useContext(GlobalStateContext);

  const logTopics = useSelector(
    globalServices.workspaceService,
    logTopicsSelector
  )

  return <>
    <div className={`${className} form-control w-60`}>
      <label className="label">
        <span className="label-text text-xs">$(jobRun.logTopics)</span>
      </label>
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered input-sm w-full max-w-xs"
        value={logTopics}
        onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_VARIABLES", { jobType: "directRequest", variable: "logTopics", value: event.target.value }))}
      />
    </div>
  </>
}