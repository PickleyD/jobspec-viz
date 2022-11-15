import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const precisionSelector = (state: any) => state.context.taskSpecific.precision;
const customIdSelector = (state: any) => state.context.customId

export const MeanTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const precision = useSelector(machine, precisionSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);
    const taskCustomId = useSelector(machine, customIdSelector)

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                label="Precision"
                value={precision}
                optional
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
