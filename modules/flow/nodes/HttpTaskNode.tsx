import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea, TextArea, TaskConfigTabs } from "./fields";
import { FieldLabel } from "../../../components";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const methodSelector = (state: any) => state.context.taskSpecific.method?.raw;
const urlSelector = (state: any) => state.context.taskSpecific.url;
const requestDataSelector = (state: any) => state.context.taskSpecific.requestData;
const enabledMockSelector = (state: any) => state.context.mock.enabled;
const mockResponseDataInputSelector = (state: any) => state.context.mock.mockResponseDataInput;
const customIdSelector = (state: any) => state.context.customId

export const HttpTaskNode = (nodeProps: NodeProps) => {
  const { machine } = nodeProps.data;

  const method = useSelector(machine, methodSelector);
  const url = useSelector(machine, urlSelector);
  const requestData = useSelector(machine, requestDataSelector);
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
          <div className="flex flex-col w-full max-w-xs">
            <FieldLabel name="Method" />
            <Select
              value={method}
              defaultValue="GET"
              onValueChange={(newValue) => machine.send("SET_TASK_SPECIFIC_PROPS", { value: { method: { raw: newValue, rich: newValue } } })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PowerTextArea
            label="URL"
            value={url}
            onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
              value: {
                url: {
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
            placeholder="Provide a mock HTTP response to test the rest of your pipeline with"
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
