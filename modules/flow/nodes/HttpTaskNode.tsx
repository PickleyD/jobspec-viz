import { TaskNode } from "./TaskNode";
import { Handle, NodeProps, Position } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";

const methodSelector = (state: any) => state.context.taskSpecific.method;

export const HttpTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const method = useSelector(machine, methodSelector);

  const handleMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;

    machine.send("SET_TASK_SPECIFIC_PROPS", { value: { method: newValue } });
  };

  return (
    <TaskNode {...nodeProps}>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Method</span>
        </label>
        <select
          className="select select-bordered"
          defaultValue="GET"
          value={method}
          onChange={handleMethodChange}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
    </TaskNode>
  );
};
