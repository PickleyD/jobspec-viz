import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"

const cronValueSelector = (state: any) => state.context.jobTypeSpecific.cron.schedule.value;
const cronValiditySelector = (state: any) => state.context.jobTypeSpecific.cron.schedule.valid;

export const CronFields = () => {

    const globalServices = useContext(GlobalStateContext);

    const cron = useSelector(
        globalServices.workspaceService,
        cronValueSelector
    )

    const isValid = useSelector(
        globalServices.workspaceService,
        cronValiditySelector
    )

    return <>
        <pre data-prefix=">" className={`${isValid ? "text-success" : "text-error"}`}>
            <code>{`schedule = "CRON_TZ=UTC ${cron}"`}</code>
        </pre>
    </>
}