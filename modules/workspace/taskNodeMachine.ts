import { isAddress } from "ethers/lib/utils";
import { createMachine, assign } from "xstate";
import { sendParent } from "xstate/lib/actions";

export type XYCoords = {
  x: number;
  y: number;
};

export type TaskNodeOptions = {
  id: string;
  initialCoords: XYCoords;
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
  | { type: "RESET" };

export const tasks = ["HTTP", "BRIDGE", "JSONPARSE", "CBORPARSE", "ETHTX", "SUM", "DIVIDE", "MULTIPLY", "ANY", "MODE", "MEAN", "MEDIAN"] as const
export type TASK_TYPE = typeof tasks[number]

type TaskMock = {
  mockResponseData?: any;
  enabled: boolean;
}

export interface TaskNodeContext {
  customId?: string;
  coords: XYCoords;
  taskType: TASK_TYPE;
  incomingNodes: Array<string>;
  outgoingNodes: Array<string>;
  taskSpecific: any;
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
    enabled: true
  },
  isValid: false,
  runResult: undefined
};

const validateAddress = (input: string) => isAddress(input)

const validateTask = (context: TaskNodeContext) => {
  let result = false;

  switch (context.taskType) {
    case "HTTP": {
      result = context.taskSpecific.url
        && context.taskSpecific.url.length > 0
      break;
    }
    case "BRIDGE": {
      result = context.taskSpecific.name
        && context.taskSpecific.name.length > 0
      break;
    }
    case "JSONPARSE": {
      result = context.taskSpecific.data
        && context.taskSpecific.data.length > 0
        && context.taskSpecific.path
        && context.taskSpecific.path.length > 0
      break;
    }
    case "CBORPARSE": {
      result = context.taskSpecific.data
        && context.taskSpecific.data.length > 0
      break;
    }
    case "ETHTX": {
      result = context.taskSpecific.to
        && context.taskSpecific.to.length > 0
        && validateAddress(context.taskSpecific.to)
        && context.taskSpecific.data
        && context.taskSpecific.data.length > 0
      break;
    }
    case "SUM": {
      // TODO: Think how to validate tasks where 'propagateResult' may be false on inputs when parsing pipeline
      result = true //context.incomingNodes.length > 0 || (context.taskSpecific.values && context.taskSpecific.values.length > 0)
      break;
    }
    case "MULTIPLY": {
      result = context.taskSpecific.input
        && context.taskSpecific.input.length > 0
        && context.taskSpecific.times
        && context.taskSpecific.times.length > 0
      break;
    }
    case "DIVIDE": {
      result = context.taskSpecific.input
        && context.taskSpecific.input.length > 0
        && context.taskSpecific.divisor
        && context.taskSpecific.divisor.length > 0
        && context.taskSpecific.precision
        && context.taskSpecific.precision.length > 0
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
        && context.taskSpecific.precision.length > 0
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
                sendParent(() => ({
                  type: "SIMULATOR_NEXT_TASK"
                }))
              ]
            },
            onError: { target: "error" }
          }
        },
        inspectingResult: {
          always: [
            { target: "error", cond: "resultHasError" },
            { target: "success" }
          ]
        },
        success: {
        },
        error: {
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
              taskSpecific: (context, event) => ({
                ...context.taskSpecific,
                ...event.value,
              }),
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
              coords: (context, event) => (event.value),
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
                options: {
                  ...context.taskSpecific
                },
                mockResponse: context.mock.enabled ? context.mock.mockResponseData : undefined
              }
            )
          })
            .then(res => res.json().then(json => {
              return res.ok ? json : Promise.reject(json);
            }))
        }
      },
      guards: {
        hasNoIncomingNodes: (context, event) => {
          return context.incomingNodes.length === 0
        },
        resultHasError: (context, event) => {
          return context.runResult.error.length > 0
        }
      }
    },
  );
};
