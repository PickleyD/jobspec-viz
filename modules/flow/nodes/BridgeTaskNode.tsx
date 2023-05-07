import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea, TaskConfigTabs, TextArea } from "./fields";
import { FieldLabel } from "../../../components";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const nameSelector = (state: any) => state.context.taskSpecific.name;
const requestDataSelector = (state: any) => state.context.taskSpecific.requestData;
const mockResponseDataSelector = (state: any) => state.context.mock.mockResponseData;
const asyncSelector = (state: any) => state.context.taskSpecific.async;
const customIdSelector = (state: any) => state.context.customId

export const BridgeTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const name = useSelector(machine, nameSelector);
  const requestData = useSelector(machine, requestDataSelector);
  const async = useSelector(machine, asyncSelector);
  const mockResponseData = useSelector(machine, mockResponseDataSelector);

  const incomingNodes = useSelector(machine, incomingNodesSelector);
  const taskCustomId = useSelector(machine, customIdSelector)

  return (
    <TaskNode {...nodeProps}>
      <TaskConfigTabs
        config={<>
          <PowerTextArea
            label="Name"
            value={name}
            onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
              value: {
                name: {
                  raw: newValue,
                  rich: newRichValue
                }
              }
            })}
            ownerNodeCustomId={taskCustomId}
          />
          <PowerTextArea
            label="Request Data"
            optional
            placeholder="Statically-defined payload to be sent to the external adapter"
            value={requestData}
            onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
              value: {
                requestData: {
                  raw: newValue,
                  rich: newRichValue
                }
              }
            })}
            ownerNodeCustomId={taskCustomId}
          />
          <div className="form-control w-full max-w-xs">
            <FieldLabel name="Async" />
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
        </>}
        test={<>
          <TextArea
            textAreaClassName="h-48"
            label="Mock Response"
            placeholder="Provide a mock bridge response to test the rest of your pipeline with"
            value={mockResponseData}
            onChange={(newValue) => machine.send("SET_MOCK_RESPONSE", { value: { mockResponseData: newValue } })}
          />
        </>}
      />
    </TaskNode>
  );
};
