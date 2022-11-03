import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField, PowerTextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const nameSelector = (state: any) => state.context.taskSpecific.name;
const requestDataSelector = (state: any) => state.context.taskSpecific.requestData;
const asyncSelector = (state: any) => state.context.taskSpecific.async;

export const BridgeTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const name = useSelector(machine, nameSelector);
  const requestData = useSelector(machine, requestDataSelector);
  const async = useSelector(machine, asyncSelector);

  const incomingNodes = useSelector(machine, incomingNodesSelector);

  return (
    <TaskNode {...nodeProps}>
      <PowerTextField
        label="Name"
        value={name}
        onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { name: newValue } })}
        incomingNodes={incomingNodes}
      />
      <PowerTextArea
        label="Request Data"
        optional
        placeholder="Statically-defined payload to be sent to the external adapter"
        value={requestData}
        onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { requestData: newValue } })}
        incomingNodes={incomingNodes}
      />
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Async</span>
        </label>
        <select
          className="select select-bordered"
          defaultValue="no"
          value={async}
          onChange={(event) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { async: event.target.value } })}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
    </TaskNode>
  );
};
