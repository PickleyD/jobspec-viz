import { ethers } from "ethers";
import { createMachine, assign, send, actions } from "xstate";
import { sendParent } from "xstate/lib/actions";
import { NodeContext, NodeOptions, XYCoords } from "./node"

export type TaskNodeOptions = NodeOptions & {
  taskType: TASK_TYPE;
};

export type TaskNodeEvent =
  | { type: "ADD_INCOMING_NODE"; nodeId: string }
  | { type: "ADD_OUTGOING_NODE"; nodeId: string }
  | { type: "UPDATE_INCOMING_NODE"; nodeId: string; prevNodeId: string; }
  | { type: "UPDATE_OUTGOING_NODE"; nodeId: string; prevNodeId: string; }
  | { type: "REMOVE_INCOMING_NODE"; nodeId: string }
  | { type: "REMOVE_OUTGOING_NODE"; nodeId: string }
  | { type: "SET_CUSTOM_ID"; value: string }
  | { type: "SET_TASK_SPECIFIC_PROPS"; value: object }
  | { type: "SET_MOCK_RESPONSE"; value: object }
  | { type: "UPDATE_COORDS"; value: XYCoords }
  | { type: "SET_PENDING_RUN" }
  | { type: "TRY_RUN_TASK"; input64s: Array<string>; vars64: string }
  | { type: "TRY_RUN_SIDE_EFFECT"; provider: any; }
  | { type: "SKIP_SIDE_EFFECT" }
  | { type: "RESET" };

export const tasks = [
  "HTTP",
  "BRIDGE",
  "JSONPARSE",
  "CBORPARSE",
  "ETHCALL",
  "ETHTX",
  "SUM",
  "DIVIDE",
  "MULTIPLY",
  "ANY",
  "MODE",
  "MEAN",
  "MEDIAN",
  "ETHABIENCODE",
  "ETHABIDECODE",
  "ETHABIDECODELOG",
  "LESSTHAN",
  "LENGTH",
  "LOOKUP"
] as const
export type TASK_TYPE = typeof tasks[number]

type TaskMock = {
  mockResponseDataInput?: any;
  mockResponseData?: any;
  enabled: boolean;
}

export interface TaskNodeContext extends NodeContext {
  customId?: string;
  taskType: TASK_TYPE;
  taskSpecific: {
    [key: string]: {
      raw: string;
      rich: string;
    }
  };
  mock: TaskMock;
  isValid: boolean;
  runResult: any;
}

const defaultContext: TaskNodeContext = {
  customId: undefined,
  coords: { x: 0, y: 0 },
  taskType: "SUM",
  incomingNodes: [],
  outgoingNodes: [],
  taskSpecific: {},
  mock: {
    mockResponseData: undefined,
    enabled: true
  },
  isValid: false,
  runResult: undefined
};

const validateAddress = (input: string) => ethers.utils.isAddress(input)

const validateTask = (context: TaskNodeContext) => {
  let result = true;

  switch (context.taskType) {
    case "HTTP": {
      result = context.taskSpecific.url
        && (context.taskSpecific.url.raw?.length ?? 0) > 0
      break;
    }
    case "BRIDGE": {
      result = context.taskSpecific.name
        && (context.taskSpecific.name.raw?.length ?? 0) > 0
      break;
    }
    case "JSONPARSE": {
      result = context.taskSpecific.data
        && (context.taskSpecific.data.raw?.length ?? 0) > 0
        && context.taskSpecific.path
        && (context.taskSpecific.path.raw?.length ?? 0) > 0
      break;
    }
    case "CBORPARSE": {
      result = context.taskSpecific.data
        && (context.taskSpecific.data.raw?.length ?? 0) > 0
      break;
    }
    case "ETHTX": {
      result = context.taskSpecific.to
        && (context.taskSpecific.to.raw?.length ?? 0) > 0
        && validateAddress(context.taskSpecific.to.raw)
        && context.taskSpecific.data
        && (context.taskSpecific.data.raw?.length ?? 0) > 0
      break;
    }
    case "ETHCALL": {
      result = context.taskSpecific.contract
        && (context.taskSpecific.contract.raw?.length ?? 0) > 0
        && validateAddress(context.taskSpecific.contract.raw)
        && context.taskSpecific.data
        && (context.taskSpecific.data.raw?.length ?? 0) > 0
      break;
    }
    case "SUM": {
      // TODO: Think how to validate tasks where 'propagateResult' may be false on inputs when parsing pipeline
      result = true //context.incomingNodes.length > 0 || (context.taskSpecific.values && context.taskSpecific.values.length > 0)
      break;
    }
    case "MULTIPLY": {
      result = context.taskSpecific.input
        && (context.taskSpecific.input.raw?.length ?? 0) > 0
        && context.taskSpecific.times
        && (context.taskSpecific.times.raw?.length ?? 0) > 0
      break;
    }
    case "DIVIDE": {
      result = context.taskSpecific.input
        && (context.taskSpecific.input.raw?.length ?? 0) > 0
        && context.taskSpecific.divisor
        && (context.taskSpecific.divisor.raw?.length ?? 0) > 0
        && context.taskSpecific.precision
        && (context.taskSpecific.precision.raw?.length ?? 0) > 0
      break;
    }
    case "ANY": {
      result = context.incomingNodes.length > 0
      break;
    }
    case "MODE": {
      result = context.incomingNodes.length > 0
      break;
    }
    case "MEAN": {
      result = context.incomingNodes.length > 0
        && context.taskSpecific.precision
        && (context.taskSpecific.precision.raw?.length ?? 0) > 0
      break;
    }
    case "MEDIAN": {
      result = context.incomingNodes.length > 0
      break;
    }
  }

  return result;
};

export const createTaskNodeMachine = (
  initialContext: Partial<TaskNodeContext>
) => {
  const fullInitialContext = {
    ...defaultContext,
    ...initialContext,
  };

  return createMachine<TaskNodeContext, TaskNodeEvent>(
    {
      id: "taskNode",
      context: {
        ...fullInitialContext
      },
      initial: "idle",
      states: {
        idle: {
          entry: ["revalidateTask"],
        },
        pendingRun: {
          on: {
            TRY_RUN_TASK: {
              target: "running"
            }
          }
        },
        running: {
          invoke: {
            src: "runTask",
            id: "runTask",
            onDone: {
              target: "inspectingResult",
              actions: [
                assign((_, event) => ({
                  runResult: event.data
                })),
                sendParent((context, event) => ({
                  value: event.data,
                  nodeId: context.customId,
                  type: "STORE_TASK_RUN_RESULT"
                })),
                // sendParent(() => ({
                //   type: "SIMULATOR_NEXT_TASK"
                // }))
              ]
            },
            onError: { target: "error" }
          }
        },
        inspectingResult: {
          always: [
            { target: "pendingSideEffect", cond: "resultHasPendingSideEffectData" },
            { target: "error", cond: "resultHasError" },
            { target: "success" }
          ]
        },
        success: {
          entry: [
            sendParent(() => ({
              type: "SIMULATOR_NEXT_TASK"
            }))
          ]
        },
        error: {
          entry: [
            sendParent(() => ({
              type: "SIMULATOR_NEXT_TASK"
            }))
          ]
        },
        pendingSideEffect: {
          entry: [
            sendParent(() => ({
              type: "SIMULATOR_PROMPT_SIDE_EFFECT"
            }))
          ],
          on: {
            TRY_RUN_SIDE_EFFECT: {
              target: "executingSideEffect"
            },
            SKIP_SIDE_EFFECT: {
              target: "skippingSideEffect"
            },
          }
        },
        executingSideEffect: {
          invoke: {
            src: "executeSideEffect",
            id: "executeSideEffect",
            onDone: {
              target: "pendingRun",
              // @ts-ignore
              actions: actions.pure((context, event) => {
                return [
                  assign({
                    // @ts-ignore
                    mock: (context, event) => ({
                      // @ts-ignore
                      mockResponseDataInput: event.data,
                      // @ts-ignore
                      mockResponseData: event.data,
                      enabled: true
                    })
                  }),
                  sendParent(() => ({
                    type: "TRY_RUN_CURRENT_TASK"
                  }))
                ];
              }),
            },
            onError: { target: "error" }
          }
        },
        skippingSideEffect: {
          entry: [
            actions.pure((context, event) => {
              return [
                assign({
                  // @ts-ignore
                  mock: (context, event) => ({
                    // @ts-ignore
                    ...context.mock,
                    enabled: true
                  })
                }),
                sendParent(() => ({
                  type: "TRY_RUN_CURRENT_TASK"
                }))
              ];
            })
          ],
          always: [{ target: "pendingRun" }]
        }
      },
      on: {
        ADD_INCOMING_NODE: {
          actions: [
            assign({
              incomingNodes: (context, event) => [
                ...context.incomingNodes,
                event.nodeId,
              ],
            }),
            sendParent("REGENERATE_TOML"),
            "revalidateTask"
          ],
        },
        ADD_OUTGOING_NODE: {
          actions: [
            assign({
              outgoingNodes: (context, event) => [
                ...context.outgoingNodes,
                event.nodeId,
              ],
            }),
            sendParent("REGENERATE_TOML"),
          ],
        },
        REMOVE_INCOMING_NODE: {
          actions: [
            assign({
              incomingNodes: (context, event) =>
                context.incomingNodes.filter(
                  (incomingNode: string) => incomingNode !== event.nodeId
                ),
            }),
            sendParent("REGENERATE_TOML"),
            "revalidateTask"
          ],
        },
        REMOVE_OUTGOING_NODE: {
          actions: [
            assign({
              outgoingNodes: (context, event) =>
                context.outgoingNodes.filter(
                  (outgoingNode: string) => outgoingNode !== event.nodeId
                ),
            }),
            sendParent("REGENERATE_TOML"),
          ],
        },
        UPDATE_INCOMING_NODE: {
          actions: [
            assign({
              incomingNodes: (context, event) =>
                context.incomingNodes.map(incomingNode => incomingNode === event.prevNodeId ? event.nodeId : incomingNode)
            }),
            sendParent("REGENERATE_TOML"),
            "revalidateTask"
          ]
        },
        UPDATE_OUTGOING_NODE: {
          actions: [
            assign({
              outgoingNodes: (context, event) =>
                context.outgoingNodes.map(outgoingNode => outgoingNode === event.prevNodeId ? event.nodeId : outgoingNode)
            }),
            sendParent("REGENERATE_TOML"),
            "revalidateTask"
          ]
        },
        SET_CUSTOM_ID: {
          actions: [
            assign({
              customId: (context, event) => event.value,
            }),
            sendParent("REGENERATE_TOML"),
            "revalidateTask"
          ],
        },
        SET_TASK_SPECIFIC_PROPS: {
          actions: [
            assign({
              taskSpecific: (context, event) => {
                const rawAndRich = typeof event.value === "string" ? { raw: event.value, rich: event.value } : event.value
                return {
                  ...context.taskSpecific,
                  ...rawAndRich,
                }
              },
            }),
            sendParent("REGENERATE_TOML"),
            "revalidateTask"
          ],
        },
        SET_MOCK_RESPONSE: {
          actions: assign({
            mock: (context, event) => ({
              ...context.mock,
              ...event.value,
            }),
          }),
        },
        UPDATE_COORDS: {
          actions: [
            assign({
              coords: (_, event) => (event.value),
            })
          ],
        },
        RESET: {
          target: "idle",
          actions: assign((_, event) => ({
            runResult: undefined
          }))
        },
        SET_PENDING_RUN: {
          target: "pendingRun",
          actions: assign((_, event) => ({
            runResult: undefined
          }))
        },
      },
    },
    {
      actions: {
        revalidateTask: assign({
          isValid: (context, event) => validateTask(context)
        })
      },
      services: {
        runTask: (context, event) => {
          console.log(context)
          console.log(event)
          return fetch("/api/task", {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
              {
                id: context.customId,
                name: context.taskType.toLowerCase(),
                inputs64: 'input64s' in event ? [...event.input64s] : [],
                vars64: 'vars64' in event ? event.vars64 : "",
                options: Object.fromEntries(Object.entries(context.taskSpecific).map(([k, v]) => [k, v.raw])),
                ...context.mock.enabled && { mockResponse: context.mock.mockResponseData }
              }
            )
          })
            .then(res => res.json().then(json => {
              return res.ok ? json : {
                error: json.error.message
              }
            }))
        },
        executeSideEffect: (context, event) => {

          const { To: to, Data: base64Data } = JSON.parse(context.runResult.sideEffectData)

          if (!('provider' in event)) {
            return Promise.reject("No 'provider' prop on the event inside 'executeSideEffect'")
          }

          const hexEncodedData = '0x' + Buffer.from(base64Data, 'base64').toString('hex');

          const result = event.provider.call({
            to: to,
            data: hexEncodedData
          })

          return result
        }
      },
      guards: {
        hasNoIncomingNodes: (context, event) => {
          return context.incomingNodes.length === 0
        },
        resultHasError: (context, event) => {
          return context.runResult.error && context.runResult.error.length > 0
        },
        resultHasPendingSideEffectData: (context, event) => {
          return context.runResult.sideEffectData.length > 0 && context.mock.enabled !== true
        }
      }
    },
  );
};
