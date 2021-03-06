import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const inputSelector = (state: any) => state.context.taskSpecific.input;
const divisorSelector = (state: any) => state.context.taskSpecific.divisor;
const precisionSelector = (state: any) => state.context.taskSpecific.precision;

export const DivideTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const input = useSelector(machine, inputSelector);
    const divisor = useSelector(machine, divisorSelector);
    const precision = useSelector(machine, precisionSelector);

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
                label="Divisor"
                value={divisor}
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { divisor: newValue } })}
                incomingNodes={incomingNodes}
            />
            <PowerTextField
                label="Precision"
                value={precision}
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { precision: newValue } })}
                incomingNodes={incomingNodes}
            />
        </TaskNode>
    );
};
