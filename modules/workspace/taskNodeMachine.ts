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

type TaskNodeEvent =
  | { type: "ADD_INCOMING_NODE"; nodeId: string }
  | { type: "ADD_OUTGOING_NODE"; nodeId: string }
  | { type: "UPDATE_INCOMING_NODE"; nodeId: string; prevNodeId: string; }
  | { type: "UPDATE_OUTGOING_NODE"; nodeId: string; prevNodeId: string; }
  | { type: "REMOVE_INCOMING_NODE"; nodeId: string }
  | { type: "REMOVE_OUTGOING_NODE"; nodeId: string }
  | { type: "SET_CUSTOM_ID"; value: string }
  | { type: "SET_TASK_SPECIFIC_PROPS"; value: object }
  | { type: "UPDATE_COORDS"; value: XYCoords }
  | { type: "SET_PENDING_RUN" }
  | { type: "TRY_RUN_TASK" }
  | { type: "RESET" };

export const tasks = ["HTTP", "JSONPARSE", "ETHTX", "SUM", "DIVIDE", "MULTIPLY", "ANY", "MODE", "MEAN", "MEDIAN"] as const
export type TASK_TYPE = typeof tasks[number]

interface TaskNodeContext {
  customId?: string;
  coords: XYCoords;
  taskType: TASK_TYPE;
  incomingNodes: Array<string>;
  outgoingNodes: Array<string>;
  toml: Array<string>;
  taskSpecific: any;
  isValid: boolean;
  runResult: any;
}

const defaultContext: TaskNodeContext = {
  customId: undefined,
  coords: { x: 0, y: 0 },
  taskType: "SUM",
  incomingNodes: [],
  outgoingNodes: [],
  toml: [],
  taskSpecific: {},
  isValid: false,
  runResult: undefined
};

const generateToml = (context: TaskNodeContext) => {
  let result = [];

  const spacer = new Array(context.customId ? context.customId.length + 1 : 0).join(" ")

  switch (context.taskType) {
    case "HTTP": {
      const processedRequestData = context.taskSpecific.requestData ? context.taskSpecific.requestData.replace(/\s/g, "").replace(/"/g, '\\\\"') : ""

      result = [
        `${context.customId} [type="http"`,
        `${spacer}  method=${context.taskSpecific.method || "GET"}`,
        `${spacer}  url="${context.taskSpecific.url || ""}"`,
        `${spacer}  requestData="${processedRequestData}"]`
      ];
      break;
    }
    case "JSONPARSE": {
      result = [
        `${context.customId} [type="jsonparse"`,
        `${spacer}  data="${context.taskSpecific.data || ""}"`,
        `${spacer}  path="${context.taskSpecific.path || ""}"]`,
      ];
      break;
    }
    case "ETHTX": {
      result = [
        `${context.customId} [type="ethtx"`,
        `${spacer}  to="${context.taskSpecific.to || ""}"`,
        `${spacer}  data="${context.taskSpecific.data || ""}"]`,
      ];
      break;
    }
    case "SUM": {
      result = [
        `${context.customId} [type="sum"`,
        `${spacer}  values=<[ ${context.incomingNodes.join(", ")} ]>]`
      ];
      break;
    }
    case "MULTIPLY": {
      result = [
        `${context.customId} [type="multiply"`,
        `${spacer}  input="${context.taskSpecific.input || ""}"`,
        `${spacer}  times="${context.taskSpecific.times || ""}"]`,
      ];
      break;
    }
    case "DIVIDE": {
      result = [
        `${context.customId} [type="divide"`,
        `${spacer}  input="${context.taskSpecific.input || ""}"`,
        `${spacer}  divisor="${context.taskSpecific.divisor || ""}"`,
        `${spacer}  precision="${context.taskSpecific.precision || ""}"]`
      ];
      break;
    }
    case "ANY": {
      result = [
        `${context.customId} [type="any"]`
      ];
      break;
    }
    case "MEAN": {
      result = [
        `${context.customId} [type="mean"`,
        `${spacer}  values=<[ ${context.incomingNodes.join(", ")} ]>`,
        `${spacer}  precision=${context.taskSpecific.precision || 2}]`
      ];
      break;
    }
    case "MODE": {
      result = [
        `${context.customId} [type="mode"`,
        `${spacer}  values=<[ ${context.incomingNodes.join(", ")} ]>]`
      ];
      break;
    }
    case "MEDIAN": {
      result = [
        `${context.customId} [type="median"`,
        `${spacer}  values=<[ ${context.incomingNodes.join(", ")} ]>]`
      ];
      break;
    }
  }

  return result;
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
    case "JSONPARSE": {
      result = context.taskSpecific.data
        && context.taskSpecific.data.length > 0
        && context.taskSpecific.path
        && context.taskSpecific.path.length > 0
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
      result = context.incomingNodes.length > 0
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
        ...fullInitialContext,
        toml: generateToml(fullInitialContext),
      },
      initial: "idle",
      states: {
        idle: {
          entry: ["revalidateTask"],
          on: {
            SET_PENDING_RUN: {
              target: "pendingRun"
            }
          }
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
              target: "success",
              actions: [
                assign((_, event) => ({
                  runResult: event.data
                })),
                sendParent((context, event) => ({
                  value: event.data,
                  nodeId: context.customId,
                  type: "STORE_TASK_RUN_RESULT"
                }))
              ]
            },
            onError: { target: "error" }
          }
        },
        success: {},
        error: {}
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
            "regenerateToml",
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
            "regenerateToml"
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
            "regenerateToml",
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
            "regenerateToml",
          ],
        },
        UPDATE_INCOMING_NODE: {
          actions: [
            assign({
              incomingNodes: (context, event) =>
                context.incomingNodes.map(incomingNode => incomingNode === event.prevNodeId ? event.nodeId : incomingNode)
            }),
            "regenerateToml",
            "revalidateTask"
          ]
        },
        UPDATE_OUTGOING_NODE: {
          actions: [
            assign({
              outgoingNodes: (context, event) =>
                context.outgoingNodes.map(outgoingNode => outgoingNode === event.prevNodeId ? event.nodeId : outgoingNode)
            }),
            "regenerateToml",
            "revalidateTask"
          ]
        },
        SET_CUSTOM_ID: {
          actions: [
            assign({
              customId: (context, event) => event.value,
            }),
            "regenerateToml",
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
            "regenerateToml",
            "revalidateTask"
          ],
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
        }
      },
    },
    {
      actions: {
        regenerateToml: assign({
          toml: (context, event) => generateToml(context),
        }),
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
                id: "task-0",
                name: "http",
                inputs64: [],
                options: {
                  method: "GET",
                  url: "https://reqres.in/api/users?page=2"
                }
              }
            )
          })
            .then(res => res.json())
        }
      }
      // guards: {
      //   parentsRunSuccessful: (context, event) => {
      //     return context.incomingNodes.length === 0
      //   }
      // }
    },
  );
};
