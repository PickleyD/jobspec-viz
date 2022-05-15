import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const inputSelector = (state: any) => state.context.taskSpecific.input;
const divisorSelector = (state: any) => state.context.taskSpecific.divisor;
const precisionDataSelector = (state: any) => state.context.taskSpecific.precision;

export const DivideTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const input = useSelector(machine, inputSelector);
    const divisor = useSelector(machine, divisorSelector);
    const precision = useSelector(machine, precisionDataSelector);

    const incomingNodes = useSelector(machine, incomingNodesSelector);

    console.log(incomingNodes)

    return (
        <TaskNode {...nodeProps}>
            <div className="form-control w-full max-w-xs">
                <label className="label">
                    <span className="label-text">Input</span>
                </label>
                <input
                    value={input}
                    onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { input: event.target.value } })}
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                />
            </div>
            <div className="form-control w-full max-w-xs">
                <label className="label">
                    <span className="label-text">Divisor</span>
                </label>
                <input
                    value={divisor}
                    onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { divisor: event.target.value } })}
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Precision</span>
                </label>
                <input
                    value={precision}
                    onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { precision: event.target.value } })}
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                />
            </div>
        </TaskNode>
    );
};
