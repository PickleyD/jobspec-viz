import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const inputSelector = (state: any) => state.context.taskSpecific.input;
const divisorSelector = (state: any) => state.context.taskSpecific.divisor;
const precisionDataSelector = (state: any) => state.context.taskSpecific.precision;

export const DivideTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const input = useSelector(machine, inputSelector);
    const divisor = useSelector(machine, divisorSelector);
    const precision = useSelector(machine, precisionDataSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

    return (
        <TaskNode {...nodeProps}>
            <PowerTextField
                label="Input"
                value={input}
                onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { input: event.target.value } })}
                incomingNodes={incomingNodes}
            />
            <PowerTextField
                label="Divisor"
                value={divisor}
                onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { divisor: event.target.value } })}
                incomingNodes={incomingNodes}
            />
            <PowerTextField
                label="Precision"
                value={precision}
                onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { precision: event.target.value } })}
                incomingNodes={incomingNodes}
            />
        </TaskNode>
    );
};
