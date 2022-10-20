import { createMachine, spawn, assign, send, actions } from "xstate";
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
    type: "ADD_TASK_NODE";
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
      incomingNodes: Array<string>;
      outgoingNodes: Array<string>;
    };
  }
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
  | { type: "ENABLE_TEST_MODE" }
  | { type: "STORE_TASK_RUN_RESULT"; nodeId: string, value: any; }
  | { type: "ADD_NEW_EDGE"; newEdge: Omit<CustomEdge, "id"> };

interface WorkspaceContext {
  reactFlowInstance: ReactFlowInstance | null;
  type: JOB_TYPE;
  name: string;
  externalJobId: string;
  edges: CustomEdge[];
  nodes: Nodes;
  jobTypeSpecific: any;
  totalNodesAdded: number;
  totalEdgesAdded: number;
  isConnecting: boolean;
  connectionParams: OnConnectStartParams;
  taskRunResults: TaskRunResult[];
}

type TaskRunResult = {
  id: string;
  result: any;
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
      totalEdgesAdded: 0,
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
      taskRunResults: []
    },
    on: {
      "SET_REACT_FLOW_INSTANCE": {
        actions: assign({
          reactFlowInstance: (_, event) => event.value
        })
      },
      "ADD_TASK_NODE": {
        // @ts-ignore
        actions: actions.pure((context, event) => {
          const { fromHandleId, fromNodeId, newNodeType } = event.edgeDetails

          const fromNodeCustomId = context.nodes.tasks.find(task => task.ref.id === fromNodeId)?.ref.state.context.customId

          const isFirstNode = !fromHandleId || !newNodeType
          const isForwardConnection = newNodeType === "target";

          const newNodeId = `task-${event.options.id ?? context.totalNodesAdded}`
          const newNodePresentationId = `task-${event.options.id ?? getNextUniqueTaskId(context.nodes.tasks)}`;

          const fromId = isForwardConnection
            ? fromNodeId
            : newNodeId;
          const toId = isForwardConnection
            ? newNodeId
            : fromNodeId;

          const fromPresentationId = isForwardConnection
            ? fromNodeCustomId
            : newNodePresentationId;
          const toPresentationId = isForwardConnection
            ? newNodePresentationId
            : fromNodeCustomId;

          return [
            assign({
              totalNodesAdded: context.totalNodesAdded + 1,
              totalEdgesAdded: context.totalEdgesAdded + 1,
              nodes: {
                ...context.nodes,
                tasks: [
                  ...context.nodes.tasks,
                  {
                    // add a new taskNodeMachine actor with a unique name
                    ref: spawn(
                      createTaskNodeMachine({
                        coords: event.options.initialCoords,
                        taskType: event.options.taskType,
                        customId: newNodePresentationId,
                        ...!isFirstNode && (isForwardConnection ? { incomingNodes: [fromNodeCustomId] } : { outgoingNodes: [fromNodeCustomId] })
                      }),
                      newNodeId
                    ),
                  },
                ],
              },
              edges: fromNodeId &&
                fromHandleId
                ? [
                  ...context.edges,
                  {
                    id: `edge-${context.totalEdgesAdded}`,
                    source: fromId,
                    sourceCustomId: fromPresentationId,
                    target: toId,
                    targetCustomId: toPresentationId,
                  },
                ]
                : context.edges
            }),
            send({ type: isForwardConnection ? "ADD_OUTGOING_NODE" : "ADD_INCOMING_NODE", nodeId: newNodePresentationId }, { to: fromNodeId })
          ]
        })
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
                    incomingNodes: event.existing.incomingNodes,
                    outgoingNodes: event.existing.outgoingNodes
                  }),
                  event.nodeId
                ),
              },
            ],
          }),
        }),
      },
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
            task.ref.send("SET_PENDING_RUN")
          }
        })
      },
      STORE_TASK_RUN_RESULT: {
        actions: assign((context, event) => {
          console.log("STORE_TASK_RUN_RESULT")
          console.log(event)

          return {
            taskRunResults: [...context.taskRunResults, { id: event.nodeId, result: event.value }]
          }
        })
      },
      ADD_NEW_EDGE: {
        actions: assign((context, event) => {
          const toAdd = {
            id: `edge-${context.totalEdgesAdded}`,
            ...event.newEdge
          }

          return {
            edges: [...context.edges, toAdd],
            totalEdgesAdded: context.totalEdgesAdded + 1
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
          type: "ADD_TASK_NODE",
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
