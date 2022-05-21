import { createMachine, spawn, assign } from "xstate";
import { createTaskNodeMachine, TaskNodeOptions } from "./taskNodeMachine";
import { Edge, useEdges } from "react-flow-renderer"

type WorkspaceEvent =
  | { type: "NEW_TASK_NODE.ADD"; options: TaskNodeOptions }
  | { type: "SET_EDGES"; newEdges: Edge<any>[] }
  | { type: "UPDATE_EDGES_WITH_NODE_ID"; nodeId: string; prevNodeId: string; }
  | { type: "SET_JOB_TYPE"; value: JOB_TYPE }
  | { type: "SET_NAME"; value: string }
  | { type: "SET_EXTERNAL_JOB_ID"; value: string }
  | { type: "SET_JOB_TYPE_SPECIFIC_PROPS"; jobType: string; prop: string; value: string };

interface WorkspaceContext {
  type: JOB_TYPE;
  name: string;
  externalJobId: string;
  edges: Edge<any>[];
  nodes: Nodes;
  jobTypeSpecific: any;
}

type Nodes = {
  tasks: Array<any>;
};

type JOB_TYPE = "cron" | "directrequest"

export const workspaceMachine = createMachine<WorkspaceContext, WorkspaceEvent>(
  {
    id: "workspace",
    initial: "idle",
    states: {
      idle: {},
    },
    context: {
      type: "cron",
      name: "",
      externalJobId: "",
      edges: [],
      nodes: {
        tasks: [],
      },
      jobTypeSpecific: {
        cron: {
          schedule: "0 0 18 1/1 * ? *"
        },
        directrequest: {}
      }
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
      },
      "UPDATE_EDGES_WITH_NODE_ID": {
        actions: assign({
          edges: (context, event) => context.edges.map(edge => ({
            ...edge,
            source: edge.source === event.prevNodeId ? event.nodeId : edge.source,
            target: edge.target === event.prevNodeId ? event.nodeId : edge.target
          }))
        })
      },
      "SET_JOB_TYPE": {
        actions: assign({
          type: (context, event) => event.value
        })
      },
      "SET_NAME": {
        actions: assign({
          name: (context, event) => event.value
        })
      },
      "SET_EXTERNAL_JOB_ID": {
        actions: assign({
          externalJobId: (context, event) => event.value
        })
      },
      "SET_JOB_TYPE_SPECIFIC_PROPS": {
        actions: assign({
          jobTypeSpecific: (context, event) => {

            let current = { ...context.jobTypeSpecific }

            current[event.jobType][event.prop] = event.value

            return current
          },
        }),
      }
    },
  }
);
