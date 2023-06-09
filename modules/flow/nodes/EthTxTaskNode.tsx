import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const toSelector = (state: any) => state.context.taskSpecific.to;
// const mockResponseDataSelector = (state: any) => state.context.mock.mockResponseData;
const customIdSelector = (state: any) => state.context.customId

export const EthTxTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const data = useSelector(machine, dataSelector);
    const to = useSelector(machine, toSelector);
    // const mockResponseData = useSelector(machine, mockResponseDataSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);
    const taskCustomId = useSelector(machine, customIdSelector)

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                label="To"
                value={to}
                placeholder="ETH address."
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                        to: {
                            raw: newValue,
                            rich: newRichValue
                        }
                    }
                })}
                ownerNodeCustomId={taskCustomId}
            />
            <PowerTextArea
                label="Data"
                value={data}
                placeholder="Likely the output of an 'ETH ABI Encode' task."
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
        </TaskNode>
    );
};
