import { TaskNode } from "./TaskNode";
import { NodeProps } from "reactflow";
import React, { useEffect } from "react";
import { useSelector } from "@xstate/react";
import { PowerTextArea, TaskConfigTabs, TextArea } from "./fields";

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const dataSelector = (state: any) => state.context.taskSpecific.data;
const contractSelector = (state: any) => state.context.taskSpecific.contract;
const fromSelector = (state: any) => state.context.taskSpecific.from;
const gasSelector = (state: any) => state.context.taskSpecific.gas;
const gasPriceSelector = (state: any) => state.context.taskSpecific.gasPrice;
const gasTipCapSelector = (state: any) => state.context.taskSpecific.gasTipCapPrice;
const gasFeeCapSelector = (state: any) => state.context.taskSpecific.gasFeeCapPrice;
const mockResponseDataInputSelector = (state: any) => state.context.mock.mockResponseDataInput;
const enabledMockSelector = (state: any) => state.context.mock.enabled;
const customIdSelector = (state: any) => state.context.customId;

export const EthCallTaskNode = (nodeProps: NodeProps) => {
    const { machine } = nodeProps.data;

    const data = useSelector(machine, dataSelector);
    const contract = useSelector(machine, contractSelector);
    const from = useSelector(machine, fromSelector);
    const gas = useSelector(machine, gasSelector);
    const gasPrice = useSelector(machine, gasPriceSelector);
    const gasTipCap = useSelector(machine, gasTipCapSelector);
    const gasFeeCap = useSelector(machine, gasFeeCapSelector);
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
                        label="Contract"
                        value={contract}
                        placeholder="Enter ETH address."
                        onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                            value: {
                                contract: {
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
                        placeholder="The data to attach to the call (including the function selector)."
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
                    <PowerTextArea
                        optional
                        label="Gas"
                        value={gas}
                        placeholder={`The amount of gas to attach to the transaction. Defaults to first set value out of:
                job spec gas limit, <- (TODO: Take account of this)
                job type specific env variable,
                global env variable,
                or chain default (normally 500,000)`}
                        onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                            value: {
                                gas: {
                                    raw: newValue,
                                    rich: newRichValue
                                }
                            }
                        })}
                        ownerNodeCustomId={taskCustomId}
                    />

                    <PowerTextArea
                        optional
                        label="From"
                        value={from}
                        placeholder="The from address with which the call should be made. Defaults to zero address."
                        onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                            value: {
                                from: {
                                    raw: newValue,
                                    rich: newRichValue
                                }
                            }
                        })}
                        ownerNodeCustomId={taskCustomId}
                    />
                    <PowerTextArea
                        optional
                        label="Gas Price"
                        value={gasPrice}
                        placeholder="Defaults to zero."
                        onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                            value: {
                                gasPrice: {
                                    raw: newValue,
                                    rich: newRichValue
                                }
                            }
                        })}
                        ownerNodeCustomId={taskCustomId}
                    />
                    <PowerTextArea
                        optional
                        label="Gas Tip Cap"
                        value={gasTipCap}
                        placeholder="Defaults to zero."
                        onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                            value: {
                                gasTipCap: {
                                    raw: newValue,
                                    rich: newRichValue
                                }
                            }
                        })}
                        ownerNodeCustomId={taskCustomId}
                    />
                    <PowerTextArea
                        optional
                        label="Gas Fee Cap"
                        value={gasFeeCap}
                        placeholder="Defaults to zero."
                        onChange={(newValue, newRichValue) => machine.send("SET_TASK_SPECIFIC_PROPS", {
                            value: {
                                gasFeeCap: {
                                    raw: newValue,
                                    rich: newRichValue
                                }
                            }
                        })}
                        ownerNodeCustomId={taskCustomId}
                    />
                    {/* TODO - Boolean 'Gas Unlimited' field */}
                </>
                }
                test={
                    <>
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
                            onChange={(newValue) => machine.send("SET_MOCK_RESPONSE", { value: { mockResponseDataInput: newValue, mockResponseData: newValue } })}
                        />
                    </>
                }
            />
        </TaskNode>
    );
};
