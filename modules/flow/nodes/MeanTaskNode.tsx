import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const precisionSelector = (state: any) => state.context.taskSpecific.precision;

export const MeanTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const precision = useSelector(machine, precisionSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

    return (
        <TaskNode {...nodeProps}>
            <PowerTextField
                label="Precision"
                value={precision}
                optional
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { precision: newValue } })}
                incomingNodes={incomingNodes}
            />
        </TaskNode>
    );
};
