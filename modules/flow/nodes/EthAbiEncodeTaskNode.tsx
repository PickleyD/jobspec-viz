import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea, TextArea, TaskConfigTabs } from "./fields";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const abiSelector = (state: any) => state.context.taskSpecific.abi;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const enabledMockSelector = (state: any) => state.context.mock.enabled;
const mockResponseDataInputSelector = (state: any) => state.context.mock.mockResponseDataInput;
const customIdSelector = (state: any) => state.context.customId

export const EthAbiEncodeTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const abi = useSelector(machine, abiSelector);
  const data = useSelector(machine, dataSelector);
  const mockResponseDataInput = useSelector(machine, mockResponseDataInputSelector);
  const enabledMock = useSelector(machine, enabledMockSelector);

  const incomingNodes = useSelector(machine, incomingNodesSelector);
  const taskCustomId = useSelector(machine, customIdSelector)

  const handleToggleMockEnabled = () => {
    machine.send("SET_MOCK_RESPONSE", { value: { enabled: !enabledMock } })
  }

  return (
    <TaskNode {...nodeProps}>
      <TaskConfigTabs
        config={<>
          <PowerTextArea
            label="ABI"
            value={abi}
            onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
              value: {
                abi: {
                  raw: newValue,
                  rich: newRichValue
                }
              }
            })}
            ownerNodeCustomId={taskCustomId}
          />
          <PowerTextArea
            label="Data"
            value={data}
            onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
              value: {
                data: {
                  raw: newValue,
                  rich: newRichValue
                }
              }
            })}
            ownerNodeCustomId={taskCustomId}
          />
        </>
        }
        test={<>
          <div className="flex items-center gap-2 mb-2 mt-3">
            <Switch id="enable-mock" checked={enabledMock} onCheckedChange={handleToggleMockEnabled} />
            <Label htmlFor="enable-mock">Enable Mock Response</Label>
          </div>
          <TextArea
            displayJsonValidity
            disabled={!enabledMock}
            textAreaClassName="h-48"
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
