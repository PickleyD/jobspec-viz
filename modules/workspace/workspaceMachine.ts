import { createMachine, spawn, assign, send } from "xstate";
import {
  createTaskNodeMachine,
  TaskNodeOptions,
  TASK_TYPE,
  XYCoords,
} from "./taskNodeMachine";
import { Edge, OnConnectStartParams, ReactFlowInstance } from "react-flow-renderer";
import { isAddress } from "ethers/lib/utils";

type CustomEdge = Edge & { sourceCustomId: string; targetCustomId: string };
export type NEW_NODE_TYPE = "source" | "target";

type WorkspaceEvent =
  | {
      type: "SET_REACT_FLOW_INSTANCE", value: ReactFlowInstance
    }
  | {
      type: "NEW_TASK_NODE.ADD";
      options: TaskNodeOptions;
      edgeDetails: {
        newNodeType: NEW_NODE_TYPE;
        fromHandleId: string;
        fromNodeId: string;
      };
    }
  | { type: "DELETE_TASK_NODE"; nodeId: string }
  | {
      type: "REPLACE_TASK_NODE";
      nodeId: string;
      newType: TASK_TYPE;
      existing: {
        coords: XYCoords;
        customId: string;
      };
    }
  | { type: "SET_EDGES"; newEdges: CustomEdge[] }
  | { type: "UPDATE_EDGES_WITH_NODE_ID"; nodeId: string; prevNodeId: string }
  | { type: "SET_JOB_TYPE"; value: JOB_TYPE }
  | { type: "SET_NAME"; value: string }
  | { type: "SET_EXTERNAL_JOB_ID"; value: string }
  | {
      type: "SET_JOB_TYPE_SPECIFIC_PROPS";
      jobType: string;
      prop: string;
      value?: string;
      valid?: boolean;
    }
  | { type: "CONNECTION_START"; params: OnConnectStartParams }
  | { type: "CONNECTION_END"; initialCoords: XYCoords }
  | { type: "ENABLE_TEST_MODE" };

interface WorkspaceContext {
  reactFlowInstance: ReactFlowInstance | null;
  type: JOB_TYPE;
  name: string;
  externalJobId: string;
  edges: CustomEdge[];
  nodes: Nodes;
  jobTypeSpecific: any;
  totalNodesAdded: number;
  isConnecting: boolean;
  connectionParams: OnConnectStartParams;
}

type Nodes = {
  tasks: Array<any>;
};

export type JOB_TYPE = "cron" | "directrequest";

const getNextUniqueTaskId = (tasks: Array<any>) => {
  const tasksCustomIdsWithDefaultFormat = tasks
    .map((task) => task.ref.state.context.customId)
    .filter((customId) => customId.startsWith("task-"));

  let id = 0;

  while (tasksCustomIdsWithDefaultFormat.includes(`task-${id.toString()}`)) {
    id++;
  }

  return id.toString();
};

const validateAddress = (input: string) => isAddress(input);

const validateJobTypeSpecifics = (jobTypeSpecifics: any, event: any) => {
  const { jobType, prop, value } = event;

  let validatedJobTypeSpecifics = { ...jobTypeSpecifics };

  switch (jobType) {
    case "cron":
      break;
    case "directRequest":
      validatedJobTypeSpecifics.directRequest.contractAddress.valid =
        validateAddress(
          validatedJobTypeSpecifics.directRequest.contractAddress.value
        );
      validatedJobTypeSpecifics.directRequest.minContractPaymentLinkJuels.valid =
        validatedJobTypeSpecifics.directRequest.minContractPaymentLinkJuels
          .value !== "" &&
        validatedJobTypeSpecifics.directRequest.minContractPaymentLinkJuels
          .value >= 0;
      validatedJobTypeSpecifics.directRequest.minIncomingConfirmations.valid =
        validatedJobTypeSpecifics.directRequest.minIncomingConfirmations
          .value !== "" &&
        validatedJobTypeSpecifics.directRequest.minIncomingConfirmations
          .value >= 1;
  }

  return validatedJobTypeSpecifics;
};

export const workspaceMachine = createMachine<WorkspaceContext, WorkspaceEvent>(
  {
    id: "workspace",
    initial: "idle",
    states: {
      idle: {},
    },
    context: {
      reactFlowInstance: null,
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
            valid: true,
          },
        },
        directRequest: {
          contractAddress: {
            value: "",
            valid: false,
          },
          minContractPaymentLinkJuels: {
            value: "",
            valid: true,
          },
          minIncomingConfirmations: {
            value: "",
            valid: true,
          },
        },
      },
      isConnecting: false,
      connectionParams: { nodeId: null, handleId: null, handleType: null },
    },
    on: {
      "SET_REACT_FLOW_INSTANCE": {
        actions: assign({
          reactFlowInstance: (context, event) => event.value
        })
      },
      "NEW_TASK_NODE.ADD": {
        actions: assign({
          totalNodesAdded: (context, event) => context.totalNodesAdded + 1,
          nodes: (context, event) => {
            return {
              ...context.nodes,
              tasks: [
                ...context.nodes.tasks,
                {
                  // add a new taskNodeMachine actor with a unique name
                  ref: spawn(
                    createTaskNodeMachine({
                      coords: event.options.initialCoords,
                      taskType: event.options.taskType,
                      customId: `task-${
                        event.options.id ??
                        getNextUniqueTaskId(context.nodes.tasks)
                      }`,
                    }),
                    `task-${event.options.id ?? context.totalNodesAdded}`
                  ),
                },
              ],
            };
          },
          edges: (context, event) => {
            const isForwardConnection =
              event.edgeDetails?.fromHandleId?.endsWith("-bottom");
            const newNodeId = `task-${
              event.options.id ?? getNextUniqueTaskId(context.nodes.tasks)
            }`;
            const fromId = isForwardConnection
              ? event.edgeDetails.fromNodeId
              : newNodeId;
            const toId = isForwardConnection
              ? newNodeId
              : event.edgeDetails.fromNodeId;

            return event.edgeDetails.fromNodeId &&
              event.edgeDetails.fromHandleId
              ? [
                  ...context.edges,
                  {
                    id: `edge-${context.edges.length}`,
                    source: fromId,
                    sourceCustomId: fromId,
                    target: toId,
                    targetCustomId: toId,
                  },
                ]
              : context.edges;
          },
        }),
      },
      DELETE_TASK_NODE: {
        actions: assign({
          nodes: (context, event) => ({
            ...context.nodes,
            tasks: [
              ...context.nodes.tasks.filter(
                (task) => task.ref.state.context.customId !== event.nodeId
              ),
            ],
          }),
          edges: (context, event) =>
            context.edges.filter(
              (edge) =>
                edge.sourceCustomId !== event.nodeId &&
                edge.targetCustomId !== event.nodeId
            ),
        }),
      },
      REPLACE_TASK_NODE: {
        actions: assign({
          nodes: (context, event) => ({
            ...context.nodes,
            tasks: [
              ...context.nodes.tasks.filter(
                (task) => task.ref.state.context.customId !== event.nodeId
              ),
              {
                // add a new taskNodeMachine actor with a unique name
                ref: spawn(
                  createTaskNodeMachine({
                    coords: event.existing.coords,
                    taskType: event.newType,
                    customId: event.existing.customId,
                  }),
                  event.nodeId
                ),
              },
            ],
          }),
        }),
      },
      // SET_EDGES: {
      //   actions: assign({
      //     edges: (context, event) => event.newEdges,
      //   }),
      // },
      UPDATE_EDGES_WITH_NODE_ID: {
        actions: assign({
          edges: (context, event) =>
            context.edges.map((edge) => ({
              ...edge,
              sourceCustomId:
                edge.sourceCustomId === event.prevNodeId
                  ? event.nodeId
                  : edge.sourceCustomId,
              targetCustomId:
                edge.targetCustomId === event.prevNodeId
                  ? event.nodeId
                  : edge.targetCustomId,
            })),
        }),
      },
      SET_JOB_TYPE: {
        actions: assign({
          type: (context, event) => event.value,
        }),
      },
      SET_NAME: {
        actions: assign({
          name: (context, event) => {
            return event.value;
          },
        }),
      },
      SET_EXTERNAL_JOB_ID: {
        actions: assign({
          externalJobId: (context, event) => event.value,
        }),
      },
      SET_JOB_TYPE_SPECIFIC_PROPS: {
        actions: [
          assign({
            jobTypeSpecific: (context, event) => {
              let current = { ...context.jobTypeSpecific };

              if (event.value !== undefined)
                current[event.jobType][event.prop].value = event.value;

              if (event.valid !== undefined)
                current[event.jobType][event.prop].valid = event.valid;

              return current;
            },
          }),
          "validateJobTypeSpecificProps",
        ],
      },
      CONNECTION_START: {
        actions: assign({
          isConnecting: (_context, _event) => true,
          connectionParams: (_context, event) => event.params,
        }),
      },
      CONNECTION_END: {
        actions: [
          assign({
            isConnecting: (_context, _event) => false,
          }),
          "addTaskNode",
        ],
      },
      ENABLE_TEST_MODE: {
        actions: (context, event) => context.nodes.tasks.forEach(task => {
          if (task.ref.state.context.incomingNodes.length === 0) {
            task.ref.send("SET_PENDING_EXEC")
          }
        })
      }
    },
  },
  {
    actions: {
      validateJobTypeSpecificProps: assign({
        jobTypeSpecific: (context, event) =>
          validateJobTypeSpecifics(context.jobTypeSpecific, event),
      }),
      addTaskNode: send((context: WorkspaceContext, event: WorkspaceEvent) => {
        const isForwardConnection =
          context.connectionParams?.handleType === "source";
        const newNodeType = isForwardConnection ? "target" : "source";
        const fromHandleId = context.connectionParams?.handleId || "";
        const fromNodeId = context.connectionParams?.nodeId || "";

        const taskType = "SUM";
        const initialCoords =
          "initialCoords" in event
            ? adjustNewSourceNodeHeightByTypeDefault(
                event.initialCoords,
                taskType,
                isForwardConnection
              )
            : { x: 0, y: 0 };

        return {
          type: "NEW_TASK_NODE.ADD",
          options: {
            initialCoords,
            taskType,
          },
          edgeDetails: {
            newNodeType,
            fromHandleId,
            fromNodeId,
          },
        };
      }),
    },
  }
);

const adjustNewSourceNodeHeightByTypeDefault = (
  initialCoords: { x: number; y: number },
  taskType: TASK_TYPE,
  isForwardConnection: boolean = true
) => {
  const taskNodeDefaultHeight = 144;

  return {
    x: initialCoords.x,
    y: isForwardConnection
      ? initialCoords.y
      : initialCoords.y - taskNodeDefaultHeight,
  };
};
