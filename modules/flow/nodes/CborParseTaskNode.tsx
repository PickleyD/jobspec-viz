import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea, PowerTextField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const modeSelector = (state: any) => state.context.taskSpecific.mode;

export const CborParseTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const data = useSelector(machine, dataSelector);
    const mode = useSelector(machine, modeSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                label="Data"
                value={data}
                placeholder="A byte array containing the CBOR payload"
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { data: newValue } })}
                incomingNodes={incomingNodes}
            />
            <div className="form-control w-full max-w-xs">
                <label className="label">
                    <span className="label-text">Mode</span>
                </label>
                <select
                    className="select select-bordered"
                    defaultValue="diet"
                    value={mode}
                    onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { mode: event.target.value } })}
                >
                    <option value="diet">diet</option>
                    <option value="standard">standard</option>
                </select>
            </div>
        </TaskNode>
    );
};
