import cronstrue from "cronstrue"
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useState, useEffect, useContext } from "react"

const cronValueSelector = (state: any) => state.context.jobTypeSpecific.cron.schedule.value;

export interface CronFieldsProps {
  className?: string;
}

export const CronFields = ({ className = "" }: CronFieldsProps) => {

  const globalServices = useContext(GlobalStateContext);

  const cron = useSelector(
    globalServices.workspaceService,
    cronValueSelector
  )

  const [friendlyCron, setFriendlyCron] = useState<string>("")

  // This validity check should be in state machine
  useEffect(() => {

    const cronAsArray = cron.trim().split(/\s+/)

    if (cronAsArray.length < 6) {
      setFriendlyCron("Too few terms")
      setCronValidity(false)
      return
    }

    if (cronAsArray.length > 6) {
      setFriendlyCron("Too many terms")
      setCronValidity(false)
      return
    }

    try {
      setFriendlyCron(cronstrue.toString(cron, { verbose: true}))
      setCronValidity(true)
    }
    catch (err) {
      setFriendlyCron("Invalid CRON expression")
      setCronValidity(false)
    }
  }, [cron])

  const setCronValidity = (isValid: boolean) => globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "cron", prop: "schedule", valid: isValid })

  return <div className={`${className} form-control w-full max-w-xs`}>
    <label className="label">
      <span className="label-text text-xs">CRON Schedule</span>
    </label>
    <input
      type="text"
      placeholder=""
      className="input input-bordered input-sm w-full max-w-xs"
      value={cron}
      onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "cron", prop: "schedule", value: event.target.value }))}
    />
    <p className="text-xs mt-2 italic max-w-[12rem]">{friendlyCron}</p>
  </div>
}