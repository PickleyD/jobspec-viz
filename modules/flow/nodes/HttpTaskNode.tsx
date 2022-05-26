import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField, PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const methodSelector = (state: any) => state.context.taskSpecific.method;
const urlSelector = (state: any) => state.context.taskSpecific.url;
const requestDataSelector = (state: any) => state.context.taskSpecific.requestData;

export const HttpTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const method = useSelector(machine, methodSelector);
  const url = useSelector(machine, urlSelector);
  const requestData = useSelector(machine, requestDataSelector);

  const incomingNodes = useSelector(machine, incomingNodesSelector);

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
      <PowerTextField
        label="URL"
        value={url}
        onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { url: newValue } })}
        incomingNodes={incomingNodes}
      />
      <PowerTextArea
        label="Request Data"
        optional
        placeholder="Type request data in JSON format"
        value={requestData}
        onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { requestData: newValue } })}
        incomingNodes={incomingNodes}
      />
    </TaskNode>
  );
};
