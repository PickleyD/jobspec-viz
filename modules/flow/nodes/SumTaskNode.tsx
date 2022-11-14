import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField, PowerTextArrayField } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const valuesSelector = (state: any) => state.context.taskSpecific.values;
const allowedFaultsSelector = (state: any) => state.context.taskSpecific.allowedFaults;

export const SumTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const values = useSelector(machine, valuesSelector);
    const allowedFaults = useSelector(machine, allowedFaultsSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

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
                incomingNodes={incomingNodes}
            />
            <PowerTextField
                label="Allowed Faults"
                value={allowedFaults}
                onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { allowedFaults: newValue } })}
                incomingNodes={incomingNodes}
                optional
            />
        </TaskNode>
    );
};
