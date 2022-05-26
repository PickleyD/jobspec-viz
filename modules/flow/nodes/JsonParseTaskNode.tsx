import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea, PowerTextField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const pathSelector = (state: any) => state.context.taskSpecific.path;

export const JsonParseTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const data = useSelector(machine, dataSelector);
    const path = useSelector(machine, pathSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                label="Data"
                value={data}
                placeholder="JSON content"
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { data: newValue } })}
                incomingNodes={incomingNodes}
            />
            <PowerTextField
                label="Path"
                value={path}
                placeholder="Comma delimited keys"
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { path: newValue } })}
                incomingNodes={incomingNodes}
            />
        </TaskNode>
    );
};
