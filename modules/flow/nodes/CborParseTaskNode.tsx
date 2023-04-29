import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea } from "./fields";
import { FieldLabel } from "../../../components";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const modeSelector = (state: any) => state.context.taskSpecific.mode;
const customIdSelector = (state: any) => state.context.customId

export const CborParseTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const data = useSelector(machine, dataSelector);
    const mode = useSelector(machine, modeSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);
    const taskCustomId = useSelector(machine, customIdSelector)

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                label="Data"
                value={data}
                placeholder="A byte array containing the CBOR payload"
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                        data: {
                            raw: newValue,
                            rich: newRichValue
                        }
                    }
                })}
                ownerNodeCustomId={taskCustomId}
            />
            <div className="form-control w-full max-w-xs">
                <FieldLabel name="Mode" />
                <select
                    className="select select-bordered"
                    defaultValue="diet"
                    value={mode}
                    onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { mode: event.target.value } })}
                >
                    <option value="diet">Diet</option>
                    <option value="standard">Standard</option>
                </select>
            </div>
        </TaskNode>
    );
};
