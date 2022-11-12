import { TaskNode } from "./TaskNode";
import { NodeProps } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextField, PowerTextArea, TextArea, TaskConfigTabs } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const abiSelector = (state: any) => state.context.taskSpecific.abi;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const enabledMockSelector = (state: any) => state.context.mock.enabled;
const mockResponseDataInputSelector = (state: any) => state.context.mock.mockResponseDataInput;

export const EthAbiDecodeTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const abi = useSelector(machine, abiSelector);
  const data = useSelector(machine, dataSelector);
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
          <PowerTextField
            label="ABI"
            value={abi}
            onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { abi: newValue } })}
            incomingNodes={incomingNodes}
          />
          <PowerTextField
            label="Data"
            value={data}
            onChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { data: newValue } })}
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
            placeholder="Provide a mock response to test the rest of your pipeline with"
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
