import { createMachine, assign } from "xstate";

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
  | { type: "REMOVE_INCOMING_NODE"; nodeId: string }
  | { type: "REMOVE_OUTGOING_NODE"; nodeId: string }
  | { type: "SET_CUSTOM_ID"; value: string }
  | { type: "SET_TASK_SPECIFIC_PROPS"; value: object };

export type TASK_TYPE = "HTTP" | "SUM" | "DIVIDE" | "MEDIAN";

interface TaskNodeContext {
  customId?: string;
  initialCoords: XYCoords;
  taskType: TASK_TYPE;
  incomingNodes: Array<string>;
  outgoingNodes: Array<string>;
  toml: Array<string>;
  taskSpecific: any;
}

const defaultContext: TaskNodeContext = {
  customId: undefined,
  initialCoords: { x: 0, y: 0 },
  taskType: "SUM",
  incomingNodes: [],
  outgoingNodes: [],
  toml: [],
  taskSpecific: {},
};

const generateToml = (context: TaskNodeContext) => {
  let result = [];

  const spacer = new Array(context.customId ? context.customId.length + 1 : 0).join(" ")

  switch (context.taskType) {
    case "HTTP": {
      result = [
        `${context.customId} [type="http"`,
        `${spacer}  method=${context.taskSpecific.method || "GET"}`,
        `${spacer}  url="${context.taskSpecific.url || ""}"`,
        `${spacer}  requestData="${context.taskSpecific.requestData || ""}"]`
      ];
      break;
    }
    case "SUM": {
      result = [
        `${context.customId} [type="sum"`,
        `${spacer}  values<[ ${context.incomingNodes.join(", ")} ]>]`
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
    case "MEDIAN": {
      result = [
        `${context.customId} [type="median"`,
        `${spacer}  values<[ ${context.incomingNodes.join(", ")} ]>]`
      ];
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
        idle: {},
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
            "regenerateToml",
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
            })
          ]
        },
        SET_CUSTOM_ID: {
          actions: [
            assign({
              customId: (context, event) => event.value,
            }),
            "regenerateToml",
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
          ],
        },
      },
    },
    {
      actions: {
        regenerateToml: assign({
          toml: (context, event) => generateToml(context),
        }),
      },
    }
  );
};
