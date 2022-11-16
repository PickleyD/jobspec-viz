import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const inputSelector = (state: any) => state.context.taskSpecific.input;
const timesSelector = (state: any) => state.context.taskSpecific.times;
const customIdSelector = (state: any) => state.context.customId

export const MultiplyTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const input = useSelector(machine, inputSelector);
    const times = useSelector(machine, timesSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);
    const taskCustomId = useSelector(machine, customIdSelector)

    return (
        <TaskNode {...nodeProps}>
            <PowerTextArea
                label="Input"
                placeholder="The value to be multipled."
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
                label="Times"
                placeholder="The value to multiply the input with."
                value={times}
                onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                    value: {
                      times: {
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
