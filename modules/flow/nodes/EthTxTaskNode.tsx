import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea, PowerTextField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const toSelector = (state: any) => state.context.taskSpecific.to;

export const EthTxTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const data = useSelector(machine, dataSelector);
    const to = useSelector(machine, toSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

    return (
        <TaskNode {...nodeProps}>
            <PowerTextField
                label="To"
                value={to}
                placeholder="Enter ETH address"
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { to: newValue } })}
                incomingNodes={incomingNodes}
            />
            <PowerTextArea
                label="Data"
                value={data}
                placeholder="Likely the output of an 'ETH ABI Encode' task"
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { data: newValue } })}
                incomingNodes={incomingNodes}
            />
        </TaskNode>
    );
};
