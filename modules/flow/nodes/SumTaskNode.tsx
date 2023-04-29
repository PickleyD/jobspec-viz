import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArrayField, PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const valuesSelector = (state: any) => state.context.taskSpecific.values;
const allowedFaultsSelector = (state: any) => state.context.taskSpecific.allowedFaults;
const customIdSelector = (state: any) => state.context.customId

export const SumTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const values = useSelector(machine, valuesSelector);
    const allowedFaults = useSelector(machine, allowedFaultsSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);
    const taskCustomId = useSelector(machine, customIdSelector)

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArrayField
                label="Values"
                value={values}
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                        values: {
                            raw: newValue,
                            rich: newRichValue
                        }
                    }
                })}
                ownerNodeCustomId={taskCustomId}
            />
            <PowerTextArea
                label="Allowed Faults"
                value={allowedFaults}
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                        allowedFaults: {
                            raw: newValue,
                            rich: newRichValue
                        }
                    }
                })}
                ownerNodeCustomId={taskCustomId}
                optional
            />
        </TaskNode>
    );
};
