import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const inputSelector = (state: any) => state.context.taskSpecific.input;
const divisorSelector = (state: any) => state.context.taskSpecific.divisor;
const precisionSelector = (state: any) => state.context.taskSpecific.precision;
const customIdSelector = (state: any) => state.context.customId

export const DivideTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const input = useSelector(machine, inputSelector);
    const divisor = useSelector(machine, divisorSelector);
    const precision = useSelector(machine, precisionSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);
    const taskCustomId = useSelector(machine, customIdSelector)

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                label="Input"
                placeholder="The value to be divided."
                value={input}
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
            <PowerTextArea
                label="Divisor"
                placeholder="The value by which to divide the input."
                value={divisor}
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                        divisor: {
                            raw: newValue,
                            rich: newRichValue
                        }
                    }
                })}
                ownerNodeCustomId={taskCustomId}
            />
            <PowerTextArea
                label="Precision"
                placeholder="The number of decimal places to retain in the result."
                value={precision}
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                        precision: {
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
