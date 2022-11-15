import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"
import { TextArrayField, TextArea } from "../../flow/nodes/fields";

export interface CronVariableSettersProps {
    className?: string;
    disabled?: boolean;
}

export const CronVariableSetters = ({ className = "", disabled = false }: CronVariableSettersProps) => {

    return <>
        <div className="grid grid-rows-2 grid-flow-col gap-2 max-w-lg overflow-auto">
            <TextArea
                disabled={true}
                label="$(jobRun.meta)"
                placeholder="Not yet implemented"
                displayJsonValidity={false}
                value={""}
                onChange={() => { }}
            />
        </div>
    </>
}