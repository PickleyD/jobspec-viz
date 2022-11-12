import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField, PowerTextArea, TextArea, TaskConfigTabs } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const methodSelector = (state: any) => state.context.taskSpecific.method;
const urlSelector = (state: any) => state.context.taskSpecific.url;
const requestDataSelector = (state: any) => state.context.taskSpecific.requestData;
const enabledMockSelector = (state: any) => state.context.mock.enabled;
const mockResponseDataInputSelector = (state: any) => state.context.mock.mockResponseDataInput;

export const HttpTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const method = useSelector(machine, methodSelector);
  const url = useSelector(machine, urlSelector);
  const requestData = useSelector(machine, requestDataSelector);
  const mockResponseDataInput = useSelector(machine, mockResponseDataInputSelector);
  const enabledMock = useSelector(machine, enabledMockSelector);

  const incomingNodes = useSelector(machine, incomingNodesSelector);

  const handleToggleMockEnabled = () => {
    machine.send("SET_MOCK_RESPONSE", { value: { enabled: !enabledMock } })
  }

  return (
    <TaskNode {...nodeProps}>
      <TaskConfigTabs
        config={<>
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
            onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
              value: {
                requestData: {
                  raw: newValue,
                  rich: newRichValue
                }
              }
            })}
            incomingNodes={incomingNodes}
          />
        </>
        }
        test={<>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className={`label-text ${enabledMock ? "" : "text-gray-500"}`}>Mock response</span>
              <input type="checkbox" checked={enabledMock} className="toggle toggle-secondary" onChange={handleToggleMockEnabled} />
            </label>
          </div>
          <TextArea
            disabled={!enabledMock}
            className="h-48"
            placeholder="Provide a mock bridge response to test the rest of your pipeline with"
            value={mockResponseDataInput}
            onChange={(newValue) => machine.send("SET_MOCK_RESPONSE", { value: { mockResponseDataInput: newValue } })}
            onValidJsonChange={(newJson) => machine.send("SET_MOCK_RESPONSE", { value: { mockResponseData: newJson } })}
          />
        </>
        }
      />
    </TaskNode>
  );
};
