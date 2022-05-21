import cronstrue from "cronstrue"
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useState, useEffect, useContext } from "react"

const cronSelector = (state: any) => state.context.jobTypeSpecific.cron.schedule;

export interface CronFieldsProps {
  className?: string;
}

export const CronFields = ({ className = "" }) => {

  const globalServices = useContext(GlobalStateContext);

  const cron = useSelector(
    globalServices.workspaceService,
    cronSelector
  )

  const [friendlyCron, setFriendlyCron] = useState<string>("")

  useEffect(() => {

    const cronLength = cron.trim().split(/\s+/)

    if (cronLength.length < 7) {
      return setFriendlyCron("Too few terms")
    }

    if (cronLength.length > 7) {
      return setFriendlyCron("Too many terms")
    }

    try {
      setFriendlyCron(cronstrue.toString(cron, { verbose: true}))
    }
    catch (err) {
      setFriendlyCron("Invalid CRON expression")
    }
  }, [cron])

  return <div className={`${className} form-control w-full max-w-xs`}>
    <label className="label">
      <span className="label-text text-xs">CRON Schedule</span>
      <span className="label-text-alt text-xs">(with seconds)</span>
    </label>
    <input
      type="text"
      placeholder="Type here"
      className="input input-bordered input-sm w-full max-w-xs"
      value={cron}
      onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "cron", prop: "schedule", value: event.target.value }))}
    />
    <p className="text-xs mt-2 italic max-w-[12rem]">{friendlyCron}</p>
  </div>
}