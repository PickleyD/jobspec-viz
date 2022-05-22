import { createMachine, spawn, assign } from "xstate";
import { createTaskNodeMachine, TaskNodeOptions } from "./taskNodeMachine";
import { Edge, useEdges } from "react-flow-renderer"

type WorkspaceEvent =
  | { type: "NEW_TASK_NODE.ADD"; options: TaskNodeOptions }
  | { type: "DELETE_TASK_NODE"; nodeId: string }
  | { type: "SET_EDGES"; newEdges: CustomEdge[] }
  | { type: "UPDATE_EDGES_WITH_NODE_ID"; nodeId: string; prevNodeId: string; }
  | { type: "SET_JOB_TYPE"; value: JOB_TYPE }
  | { type: "SET_NAME"; value: string }
  | { type: "SET_EXTERNAL_JOB_ID"; value: string }
  | { type: "SET_JOB_TYPE_SPECIFIC_PROPS"; jobType: string; prop: string; value?: string; valid?: boolean };

type CustomEdge = Edge & { sourceCustomId: string; targetCustomId: string; }

interface WorkspaceContext {
  type: JOB_TYPE;
  name: string;
  externalJobId: string;
  edges: CustomEdge[];
  nodes: Nodes;
  jobTypeSpecific: any;
  totalNodesAdded: number;
}

type Nodes = {
  tasks: Array<any>;
};

type JOB_TYPE = "cron" | "directrequest"

const getNextUniqueTaskId = (tasks: Array<any>) => {
  const tasksCustomIdsWithDefaultFormat = tasks
    .map(task => task.ref.state.context.customId)
    .filter(customId => customId.startsWith("task-"))

  let id = 0

  while(tasksCustomIdsWithDefaultFormat.includes(`task-${id.toString()}`)) {
    id++
  }

  return id.toString()
}

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
      totalNodesAdded: 0,
      nodes: {
        tasks: [],
      },
      jobTypeSpecific: {
        cron: {
          schedule: {
            value: "0 0 18 * * *",
            valid: true
          }
        },
        directrequest: {}
      }
    },
    on: {
      "NEW_TASK_NODE.ADD": {
        actions: assign({
          totalNodesAdded: (context, event) => context.totalNodesAdded + 1,
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
                    customId: `task-${event.options.id ?? getNextUniqueTaskId(context.nodes.tasks)}`
                  }),
                  `task-${event.options.id ?? context.totalNodesAdded}`
                ),
              },
            ],
          }),
        }),
      },
      "DELETE_TASK_NODE": {
        actions: assign({
          nodes: (context, event) => ({
            ...context.nodes,
            tasks: [
              ...context.nodes.tasks.filter(task => task.ref.state.context.customId !== event.nodeId),
            ],
          }),
          edges: (context, event) => context.edges.filter(edge => edge.sourceCustomId !== event.nodeId && edge.targetCustomId !== event.nodeId)
        })
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
            sourceCustomId: edge.sourceCustomId === event.prevNodeId ? event.nodeId : edge.sourceCustomId,
            targetCustomId: edge.targetCustomId === event.prevNodeId ? event.nodeId : edge.targetCustomId
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

            if (event.value !== undefined) current[event.jobType][event.prop].value = event.value

            if (event.valid !== undefined) current[event.jobType][event.prop].valid = event.valid

            return current
          },
        }),
      }
    },
  }
);
