import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const inputSelector = (state: any) => state.context.taskSpecific.input;
const timesSelector = (state: any) => state.context.taskSpecific.times;

export const MultiplyTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const input = useSelector(machine, inputSelector);
    const times = useSelector(machine, timesSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

    return (
        <TaskNode {...nodeProps}>
            <PowerTextField
                label="Input"
                value={input}
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { input: newValue } })}
                incomingNodes={incomingNodes}
            />
            <PowerTextField
                label="Times"
                value={times}
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { times: newValue } })}
                incomingNodes={incomingNodes}
            />
        </TaskNode>
    );
};
