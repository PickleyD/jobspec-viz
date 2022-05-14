import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";

const methodSelector = (state: any) => state.context.taskSpecific.method;
const urlSelector = (state: any) => state.context.taskSpecific.url;
const requestDataSelector = (state: any) => state.context.taskSpecific.requestData;

export const HttpTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const method = useSelector(machine, methodSelector);
  const url = useSelector(machine, urlSelector);
  const requestData = useSelector(machine, requestDataSelector);

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
          onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { method: event.target.value } })}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">URL</span>
        </label>
        <input
          value={url}
          onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { url: event.target.value } })}
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Request Data</span>
          <span className="label-text-alt">(optional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="Type request data in JSON format"
          value={requestData}
          onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { requestData: event.target.value } })}
        >
        </textarea>
      </div>
    </TaskNode>
  );
};
