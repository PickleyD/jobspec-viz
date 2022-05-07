import { createMachine, spawn, assign } from "xstate";
import { createTaskNodeMachine, TaskNodeOptions } from "./taskNodeMachine";
import { Edge } from "react-flow-renderer"

type WorkspaceEvent =
  | { type: "NEW_TASK_NODE.ADD"; options: TaskNodeOptions }
  | { type: "SET_EDGES"; newEdges: Edge<any>[] };

interface WorkspaceContext {
  edges: Edge<any>[];
  nodes: Nodes;
}

type Nodes = {
  tasks: Array<any>;
};

export const workspaceMachine = createMachine<WorkspaceContext, WorkspaceEvent>(
  {
    id: "workspace",
    initial: "idle",
    states: {
      idle: {},
    },
    context: {
      edges: [],
      nodes: {
        tasks: [],
      },
    },
    on: {
      "NEW_TASK_NODE.ADD": {
        actions: assign({
          nodes: (context, event) => ({
            ...context.nodes,
            tasks: [
              ...context.nodes.tasks,
              {
                // add a new taskNodeMachine actor with a unique name
                ref: spawn(
                  createTaskNodeMachine({
                    initialCoords: event.options.initialCoords,
                    taskType: event.options.taskType,
                    customId: `task-${event.options.id ?? context.nodes.tasks.length}`
                  }),
                  `task-${event.options.id ?? context.nodes.tasks.length}`
                ),
              },
            ],
          }),
        }),
      },
      "SET_EDGES": {
        actions: assign({
          edges: (context, event) => event.newEdges,
        }),
      }
    },
  }
);
