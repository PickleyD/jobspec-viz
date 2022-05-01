import { createMachine, spawn, assign } from "xstate";
import { createTaskNodeMachine, TaskNodeOptions } from "./taskNodeMachine";

type WorkspaceEvent = { type: "NEW_TASK_NODE.ADD"; options: TaskNodeOptions };

interface WorkspaceContext {
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
                  }),
                  `task-${event.options.id ?? context.nodes.tasks.length}`
                ),
              },
            ],
          }),
        }),
      },
    },
  }
);
