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
  | { type: "REMOVE_INCOMING_NODE"; nodeId: string }
  | { type: "REMOVE_OUTGOING_NODE"; nodeId: string }
  | { type: "SET_CUSTOM_ID"; value: string };

export type TASK_TYPE = "SUM" | "DIVIDE" | "MEDIAN";

interface TaskNodeContext {
  customId?: string;
  initialCoords: XYCoords;
  taskType: TASK_TYPE;
  incomingNodes: Array<string>;
  outgoingNodes: Array<string>;
}

const defaultContext: TaskNodeContext = {
  customId: undefined,
  initialCoords: { x: 0, y: 0 },
  taskType: "SUM",
  incomingNodes: [],
  outgoingNodes: [],
};

export const createTaskNodeMachine = (
  initialContext: Partial<TaskNodeContext>
) => {
  const fullInitialContext = {
    ...defaultContext,
    ...initialContext,
  };

  return createMachine<TaskNodeContext, TaskNodeEvent>({
    id: "taskNode",
    context: fullInitialContext,
    initial: "idle",
    states: {
      idle: {},
    },
    on: {
      ADD_INCOMING_NODE: {
        actions: assign({
          incomingNodes: (context, event) => [
            ...context.incomingNodes,
            event.nodeId,
          ],
        }),
      },
      ADD_OUTGOING_NODE: {
        actions: assign({
          outgoingNodes: (context, event) => [
            ...context.outgoingNodes,
            event.nodeId,
          ],
        }),
      },
      REMOVE_INCOMING_NODE: {
        actions: assign({
          incomingNodes: (context, event) =>
            context.incomingNodes.filter(
              (incomingNode: string) => incomingNode !== event.nodeId
            ),
        }),
      },
      REMOVE_OUTGOING_NODE: {
        actions: assign({
          outgoingNodes: (context, event) =>
            context.outgoingNodes.filter(
              (outgoingNode: string) => outgoingNode !== event.nodeId
            ),
        }),
      },
      SET_CUSTOM_ID: {
        actions: assign({
          customId: (context, event) => event.value,
        }),
      },
    },
  });
};
