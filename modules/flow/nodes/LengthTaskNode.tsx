import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const inputSelector = (state: any) => state.context.taskSpecific.input;
const customIdSelector = (state: any) => state.context.customId

export const LengthTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const input = useSelector(machine, inputSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);
    const taskCustomId = useSelector(machine, customIdSelector)

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                optional
                label="Input"
                value={input}
                placeholder="String or byte array to be measured"
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                        input: {
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
