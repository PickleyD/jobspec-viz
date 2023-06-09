import {
  createMachine,
  spawn,
  assign,
  send,
  actions,
  ActorRefFrom,
  StateMachine,
  raise
} from "xstate";
import {
  createTaskNodeMachine,
  TaskNodeOptions,
  TaskNodeContext,
  TaskNodeEvent,
  TASK_TYPE
} from "./taskNodeMachine";
import {
  NodeOptions,
  XYCoords
} from "./node"
import {
  Edge,
  OnConnectStartParams,
  ReactFlowInstance,
} from "reactflow";
import { ethers } from "ethers";
import Web3 from "web3";
import toml from "toml"
import { fromDot, NodeRef, attribute as _ } from "ts-graphviz"
import { toast } from "react-hot-toast"
import { workspaceMachineOptions as defaultWorkspaceMachineOptions } from "./workspaceMachineOptions";
import { AiNodeContext, AiNodeEvent, createAiNodeMachine } from "./aiNodeMachine";

type CustomEdge = Edge & { sourceCustomId: string; targetCustomId: string };
export type NEW_NODE_TYPE = "source" | "target";

export type Edges = Array<CustomEdge>

export type WorkspaceEvent =
  | {
    type: "SET_REACT_FLOW_INSTANCE";
    value: ReactFlowInstance;
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
  | { type: "DELETE_NODE"; nodeId: string }
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
  | { type: "SET_GAS_LIMIT"; value: string }
  | { type: "SET_MAX_TASK_DURATION"; value: string }
  | { type: "SET_FORWARDING_ALLOWED"; value: string }
  | {
    type: "SET_JOB_TYPE_SPECIFIC_PROPS";
    jobType: JOB_TYPE;
    prop: string;
    value?: string;
    valid?: boolean;
  }
  | {
    type: "SET_JOB_TYPE_SPECIFIC_VARIABLES";
    jobType: JOB_TYPE;
    variable: string;
    value?: string;
    values?: Array<string>;
    valid?: boolean;
  }
  | { type: "CONNECTION_START"; params: OnConnectStartParams }
  | { type: "CONNECTION_END" }
  | { type: "CONNECTION_SUCCESS"; initialCoords: XYCoords }
  | { type: "TOGGLE_TEST_MODE" }
  | { type: "STORE_TASK_RUN_RESULT"; nodeId: string; value: any }
  | { type: "ADD_NEW_EDGE"; newEdge: Omit<CustomEdge, "id"> }
  | { type: "REGENERATE_TOML" }
  | { type: "SIMULATOR_PREV_TASK" }
  | { type: "TRY_RUN_CURRENT_TASK" }
  | { type: "SIMULATOR_NEXT_TASK" }
  | { type: "SIMULATOR_PROMPT_SIDE_EFFECT" }
  | { type: "PERSIST_STATE" }
  | { type: "RESTORE_STATE"; savedContext: WorkspaceContext }
  | { type: "TRY_RUN_CURRENT_SIDE_EFFECT" }
  | { type: "SKIP_CURRENT_SIDE_EFFECT" }
  | { type: "SAVE_JOB_SPEC_VERSION" }
  | { type: "OPEN_MODAL"; name: ModalName }
  | { type: "CLOSE_MODAL"; data: { name: ModalName } }
  | { type: "IMPORT_SPEC"; content: string }
  | { type: "TOGGLE_AI_WAND" }
  | {
    type: "ADD_AI_PROMPT_NODE";
    options: NodeOptions;
    edgeDetails: {
      newNodeType: NEW_NODE_TYPE;
      fromHandleId: string;
      fromNodeId: string;
    }
  }
  | { type: "HANDLE_AI_PROMPT_COMPLETION", value: string, parentNodes: Array<string>, childNodes: Array<string>, aiNodeId: string  };

export interface WorkspaceContext {
  reactFlowInstance: ReactFlowInstance | null;
  type: JOB_TYPE;
  name: string;
  externalJobId: string;
  gasLimit: string;
  maxTaskDuration: string;
  forwardingAllowed: boolean;
  edges: Edges;
  nodes: Nodes;
  jobTypeSpecific: JobTypeFieldMap;
  jobTypeVariables: JobTypeVarFieldMap;
  totalNodesAdded: number;
  totalEdgesAdded: number;
  isConnecting: boolean;
  connectionParams: OnConnectStartParams;
  taskRunResults: TaskRunResult[];
  toml: Array<TomlLine>;
  parsedTaskOrder: Array<TaskInstructions>;
  parsingError: string;
  currentTaskIndex: number;
  jobLevelVars64?: string;
  provider: ReturnType<typeof getProvider>;
  // Would use a Set for openModals but changes aren't detected in consumers
  openModals: Array<ModalName>;
}

type ModalName = "import"

type JobTypeFieldMap = { [key in JOB_TYPE]: { [key: string]: Field } };

type Field = {
  value: string;
  valid: boolean;
};

type JobTypeVarFieldMap = {
  [key in JOB_TYPE]: { [key: string]: JobLevelVarField };
};

type JobLevelVarField = {
  value?: string;
  values?: Array<string>;
  valid: boolean;
  type: DATA_TYPES;
  fromType?: "hex" | "string"
}

const dataTypes = ["string", "bytes", "bytes32", "int", "float", "decimal", "bool", "address", "null"]
type DATA_TYPES = typeof dataTypes[number]

export type TaskInstructions = {
  id: string;
  inputs: Array<{
    id: string;
    propagateResult: boolean;
  }>;
};

type TaskRunResult = {
  id: string;
  result: Result;
};

type Result = {
  value: string;
  error: string;
  val64: string;
  vars64: string;
  vars: { [key: string]: any };
};

export type Nodes = {
  tasks: Array<{
    ref: ActorRefFrom<StateMachine<TaskNodeContext, any, TaskNodeEvent>>;
  }>;
  ai: Array<{
    ref: ActorRefFrom<StateMachine<AiNodeContext, any, AiNodeEvent>>;
  }>;
};

export type TomlLine = {
  value: string;
  valid?: boolean;
  isObservationSrc?: boolean;
};

export const JOB_TYPES = ["cron", "directrequest", "fluxmonitor", "keeper", "offchainreporting", "webhook"] as const
export type JOB_TYPE = typeof JOB_TYPES[number];

const getNextUniqueTaskId = (tasks: Array<any>) => {
  const tasksCustomIdsWithDefaultFormat = tasks
    .map((task) => task.ref.state.context.customId)
    .filter((customId) => customId.startsWith("task_"));

  let id = 0;

  while (tasksCustomIdsWithDefaultFormat.includes(`task_${id.toString()}`)) {
    id++;
  }

  return id.toString();
};

const validateAddress = (input: string) => ethers.utils.isAddress(input);

const validateJobTypeSpecifics = (jobTypeSpecifics: any, event: any) => {
  const { jobType, prop, value } = event;

  let validatedJobTypeSpecifics = { ...jobTypeSpecifics };

  switch (jobType) {
    case "cron":
      break;
    case "directrequest":
      validatedJobTypeSpecifics.directrequest.contractAddress.valid =
        validateAddress(
          validatedJobTypeSpecifics.directrequest.contractAddress.value
        );
      validatedJobTypeSpecifics.directrequest.minContractPaymentLinkJuels.valid =
        validatedJobTypeSpecifics.directrequest.minContractPaymentLinkJuels
          .value !== "" &&
        validatedJobTypeSpecifics.directrequest.minContractPaymentLinkJuels
          .value >= 0;
      validatedJobTypeSpecifics.directrequest.minIncomingConfirmations.valid =
        validatedJobTypeSpecifics.directrequest.minIncomingConfirmations
          .value !== "" &&
        validatedJobTypeSpecifics.directrequest.minIncomingConfirmations
          .value >= 1;
  }

  return validatedJobTypeSpecifics;
};

const getProvider = (network = "") => {
  const networkToUse = "homestead"

  return ethers.getDefaultProvider(networkToUse, {
    // TODO: Add more services
    alchemy: process.env.NEXT_PUBLIC_ALCHEMY_ID
  })
}

export const workspaceMachine = createMachine<WorkspaceContext, WorkspaceEvent>(
  {
    id: "workspace",
    initial: "idle",
    states: {
      idle: {
        initial: "defaultMode",
        states: {
          defaultMode: {
            on: {
              TOGGLE_AI_WAND: {
                target: "aiWandMode"
              },
              CONNECTION_SUCCESS: {
                actions: ["handleConnectionSuccessTaskNodeAddition", "regenerateToml"],
              }
            }
          },
          aiWandMode: {
            on: {
              TOGGLE_AI_WAND: {
                target: "defaultMode"
              },
              CONNECTION_SUCCESS: {
                actions: ["handleConnectionSuccessAiPromptNodeAddition"],
              },
            }
          },
        },
        on: {
          TOGGLE_TEST_MODE: {
            target: "testModeLoading",
          },
          SAVE_JOB_SPEC_VERSION: {
            target: "savingJobSpecVersion",
          },
          IMPORT_SPEC: {
            target: "importing"
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
            ],
          },
          HANDLE_AI_PROMPT_COMPLETION: {
            actions: ["handleAiPromptCompletion"]
          }
        },
      },
      importing: {
        invoke: {
          src: "importJobSpec",
          onDone: {
            target: "idle",
            actions: [
              assign((context, event) => {

                const newPartialContext: Partial<WorkspaceContext> = event.data.constructedMachineContext

                let newContext = {
                  ...context,
                  ...newPartialContext
                }

                if ("nodes" in newPartialContext && newPartialContext.nodes) {
                  newContext = {
                    ...newContext,
                    nodes: {
                      ...newContext.nodes,
                      tasks: newPartialContext.nodes.tasks.map((entry: any) => ({
                        ...entry,
                        // @ts-ignore
                        ref: spawn(createTaskNodeMachine(entry.ref.state.context || {}), entry.ref.id),
                      })),
                    }
                  }
                }

                return newContext
              }),
              raise({ type: "CLOSE_MODAL", data: { name: "import" } }),
              "createImportToast",
              "regenerateToml",
            ]
          },
          onError: {
            target: "idle",
            actions: [
              "createImportToast"
            ]
          }
        }
      },
      savingJobSpecVersion: {
        invoke: {
          src: "saveJobSpecVersion",
          onDone: {
            target: "idle",
            actions: [
              (context, event) => toast.success("Job Spec saved successful")
            ]
          },
          onError: {
            target: "idle",
            actions: [
              (context, event) => toast.error(event.data.message)
            ]
          }
        }
      },
      testModeLoading: {
        initial: "parsingDag",
        states: {
          parsingDag: {
            invoke: {
              src: "parseSpec",
              id: "parseSpec",
              onDone: {
                target: "inspectingParseResult",
                actions: assign((_, event) => {
                  return {
                    parsedTaskOrder: event.data.tasks || [],
                    parsingError: event.data.error || ""
                  };
                }),
              },
              onError: {
                target: "#workspace.idle",
              },
            },
          },
          inspectingParseResult: {
            always: [
              { target: "#workspace.idle", cond: "hasParsingError" },
              { target: "processingJobLevelVariables" }
            ]
          },
          processingJobLevelVariables: {
            invoke: {
              src: "processJobLevelVariables",
              id: "processJobLevelVariables",
              onDone: {
                target: "#workspace.testMode",
                actions: [
                  assign((_, event) => ({
                    jobLevelVars64: event.data.vars64,
                  })),
                ],
              },
              onError: { target: "#workspace.idle" },
            },
          },
        },
      },
      testMode: {
        initial: "revalidating",
        states: {
          revalidating: {
            entry: ["setCurrentTaskPendingRun", "resetNextTask"],
            always: [{ target: "idle" }],
          },
          idle: {
            on: {
              TRY_RUN_CURRENT_TASK: { target: "processingCurrentTask" },
            },
          },
          processingCurrentTask: {
            entry: ["processCurrentTask"],
            always: [{ target: "idle" }],
          },
          error: {},
          sideEffectPrompt: {
            on: {
              TRY_RUN_CURRENT_SIDE_EFFECT: { target: "processingCurrentSideEffect" },
              SKIP_CURRENT_SIDE_EFFECT: { target: "skippingCurrentSideEffect" }
            },
          },
          processingCurrentSideEffect: {
            entry: ["executeCurrentSideEffect"],
            always: [{ target: "idle" }],
          },
          skippingCurrentSideEffect: {
            entry: ["skipCurrentSideEffect"],
            always: [{ target: "idle" }],
          },
        },
        on: {
          TOGGLE_TEST_MODE: {
            target: "idle",
            // @ts-ignore
            actions: actions.pure((context: WorkspaceContext, event) => {
              return [
                ...context.nodes.tasks.map((task) =>
                  send({ type: "RESET" }, { to: task.ref.id })
                ),
                assign({
                  parsedTaskOrder: [],
                  parsingError: "",
                  currentTaskIndex: 0,
                  taskRunResults: [],
                  jobLevelVars64: undefined,
                }),
              ];
            }),
          },
          SIMULATOR_PREV_TASK: {
            target: ".revalidating",
            // @ts-ignore
            actions: actions.pure((context: WorkspaceContext, event) => {
              if (context.currentTaskIndex === 0) return;

              const newIndex = context.currentTaskIndex - 1;

              const newTaskCustomId = context.parsedTaskOrder[newIndex].id;

              return [
                assign({
                  currentTaskIndex: newIndex,
                  taskRunResults: context.taskRunResults.filter(
                    (trr) => trr.id !== newTaskCustomId
                  ),
                }),
              ];
            }),
          },
          // TRY_RUN_CURRENT_TASK: {
          //   // @ts-ignore
          //   actions: actions.pure((context: WorkspaceContext, event) => {

          //     if (context.currentTaskIndex >= context.parsedTaskOrder.length) return

          //     // Try to execute the current task and then proceed if successful
          //     const currentTask = context.parsedTaskOrder[context.currentTaskIndex]
          //     const currentTaskCustomId = currentTask.id

          //     const currentTaskId = getTaskNodeByCustomId(context, currentTaskCustomId)?.ref.id

          //     const input64s = currentTask.inputs
          //       .filter(input => input.propagateResult === true)
          //       .map(input => context.taskRunResults.find(trr => trr.id === input.id)?.result.val64)

          //     const vars64 = context.taskRunResults.length > 0 ? context.taskRunResults[context.taskRunResults.length - 1].result.vars64 : ""

          //     return [
          //       send({ type: "TRY_RUN_TASK", input64s, vars64 }, { to: currentTaskId })
          //     ]
          //   })
          // },
          SIMULATOR_NEXT_TASK: {
            target: ".revalidating",
            actions: assign((context, event) => {
              const newIndex = context.currentTaskIndex + 1;
              return {
                currentTaskIndex:
                  newIndex <= context.parsedTaskOrder.length
                    ? context.currentTaskIndex + 1
                    : context.currentTaskIndex,
              };
            }),
          },
          SIMULATOR_PROMPT_SIDE_EFFECT: {
            target: ".sideEffectPrompt"
          }
        },
      },
      error: {},
    },
    context: {
      reactFlowInstance: null,
      type: "cron",
      name: "",
      externalJobId: "",
      gasLimit: "",
      maxTaskDuration: "",
      forwardingAllowed: false,
      edges: [],
      totalNodesAdded: 0,
      totalEdgesAdded: 0,
      nodes: {
        tasks: [],
        ai: []
      },
      jobTypeSpecific: {
        cron: {
          schedule: {
            value: "0 0 18 * * *",
            valid: true,
          },
        },
        directrequest: {
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
        fluxmonitor: {},
        keeper: {},
        offchainreporting: {},
        webhook: {}
      },
      jobTypeVariables: {
        directrequest: {
          logTopics: {
            value: "",
            values: [],
            valid: true,
            type: "string"
          },
          logData: {
            value: "",
            valid: true,
            type: "bytes",
            fromType: "hex"
          }
        },
        cron: {},
        fluxmonitor: {},
        keeper: {},
        offchainreporting: {},
        webhook: {},
      },
      isConnecting: false,
      connectionParams: { nodeId: null, handleId: null, handleType: null },
      taskRunResults: [],
      toml: [],
      parsedTaskOrder: [],
      parsingError: "",
      currentTaskIndex: 0,
      jobLevelVars64: undefined,
      provider: getProvider(),
      openModals: []
    },
    on: {
      SET_REACT_FLOW_INSTANCE: {
        actions: assign({
          reactFlowInstance: (_, event) => event.value,
        }),
      },
      ADD_TASK_NODE: {
        // @ts-ignore
        actions: actions.pure((context, event) => {
          const { fromHandleId, fromNodeId, newNodeType } = event.edgeDetails;

          const fromNodeCustomId =
            context.nodes.tasks.find((task) => task.ref.id === fromNodeId)?.ref
              .state.context.customId || "";

          const isFirstNode = !fromHandleId || !newNodeType;
          const isForwardConnection = newNodeType === "target";

          const newNodeId = `task_${event.options.id ?? context.totalNodesAdded
            }`;
          const newNodePresentationId = `task_${event.options.id ?? getNextUniqueTaskId(context.nodes.tasks)
            }`;

          const fromId = isForwardConnection ? fromNodeId : newNodeId;
          const toId = isForwardConnection ? newNodeId : fromNodeId;

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
                        ...(!isFirstNode &&
                          (isForwardConnection
                            ? { incomingNodes: [fromNodeCustomId] }
                            : { outgoingNodes: [fromNodeCustomId] })),
                      }),
                      newNodeId
                    ),
                  },
                ],
              },
              edges:
                fromNodeId && fromHandleId
                  ? [
                    ...context.edges,
                    {
                      id: `edge_${context.totalEdgesAdded}`,
                      source: fromId,
                      sourceCustomId: fromPresentationId,
                      target: toId,
                      targetCustomId: toPresentationId,
                    },
                  ]
                  : context.edges,
            }),
            send(
              {
                type: isForwardConnection
                  ? "ADD_OUTGOING_NODE"
                  : "ADD_INCOMING_NODE",
                nodeId: newNodePresentationId,
              },
              { to: fromNodeId }
            ),
            "regenerateToml",
          ];
        }),
      },
      ADD_AI_PROMPT_NODE: {
        // @ts-ignore
        actions: actions.pure((context, event) => {
          const { fromHandleId, fromNodeId, newNodeType } = event.edgeDetails;

          // from will be a task (or other) node
          const fromNodeCustomId =
            context.nodes.tasks.find((taskNode) => taskNode.ref.id === fromNodeId)?.ref
              .state.context.customId || "";

          const isFirstNode = !fromHandleId || !newNodeType;
          const isForwardConnection = newNodeType === "target";

          const newNodeId = `ai_${event.options.id ?? context.totalNodesAdded
            }`;

          const fromId = isForwardConnection ? fromNodeId : newNodeId;
          const toId = isForwardConnection ? newNodeId : fromNodeId;

          const fromPresentationId = isForwardConnection
            ? fromNodeCustomId
            : newNodeId;
          const toPresentationId = isForwardConnection
            ? newNodeId
            : fromNodeCustomId;

          return [
            assign({
              totalNodesAdded: context.totalNodesAdded + 1,
              totalEdgesAdded: context.totalEdgesAdded + 1,
              nodes: {
                ...context.nodes,
                ai: [
                  ...context.nodes.ai,
                  {
                    // add a new aiNodeMachine actor with a unique name
                    ref: spawn(
                      createAiNodeMachine({
                        id: newNodeId,
                        coords: event.options.initialCoords,
                        ...(!isFirstNode &&
                          (isForwardConnection
                            ? { incomingNodes: [fromNodeCustomId] }
                            : { outgoingNodes: [fromNodeCustomId] })),
                      }),
                      newNodeId
                    ),
                  },
                ],
              },
              edges:
                fromNodeId && fromHandleId
                  ? [
                    ...context.edges,
                    {
                      id: `edge_${context.totalEdgesAdded}`,
                      source: fromId,
                      sourceCustomId: fromPresentationId,
                      target: toId,
                      targetCustomId: toPresentationId,
                    },
                  ]
                  : context.edges,
            }),
            send(
              {
                type: isForwardConnection
                  ? "ADD_OUTGOING_NODE"
                  : "ADD_INCOMING_NODE",
                nodeId: newNodeId,
              },
              { to: fromNodeId }
            ),
            "regenerateToml",
          ];
        }),
      },
      DELETE_NODE: {
        actions: [
          assign({
            nodes: (context, event) => ({
              ...context.nodes,
              tasks: [
                ...context.nodes.tasks.filter(
                  (node) => node.ref.id !== event.nodeId
                ),
              ],
              ai: [
                ...context.nodes.ai.filter(
                  (node) => node.ref.id !== event.nodeId
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
          "regenerateToml",
        ],
      },
      REPLACE_TASK_NODE: {
        actions: [
          assign({
            nodes: (context, event) => {
              return {
                ...context.nodes,
                tasks: [
                  ...context.nodes.tasks.filter(
                    (task) => task.ref.id !== event.nodeId
                  ),
                  {
                    // add a new taskNodeMachine actor with a unique name
                    ref: spawn(
                      createTaskNodeMachine({
                        coords: event.existing.coords,
                        taskType: event.newType,
                        customId: event.existing.customId,
                        incomingNodes: event.existing.incomingNodes,
                        outgoingNodes: event.existing.outgoingNodes,
                      }),
                      event.nodeId
                    ),
                  },
                ],
              }
            },
          }),
          "regenerateToml",
        ],
      },
      UPDATE_EDGES_WITH_NODE_ID: {
        actions: [
          assign({
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
          "regenerateToml",
        ],
      },
      SET_JOB_TYPE: {
        actions: [
          assign({
            type: (context, event) => event.value,
          }),
          "regenerateToml",
        ],
      },
      SET_NAME: {
        actions: [
          assign({
            name: (context, event) => {
              return event.value;
            },
          }),
          "regenerateToml",
        ],
      },
      SET_EXTERNAL_JOB_ID: {
        actions: [
          assign({
            externalJobId: (context, event) => event.value,
          }),
          "regenerateToml",
        ],
      },
      SET_GAS_LIMIT: {
        actions: [
          assign({
            gasLimit: (context, event) => event.value,
          }),
          "regenerateToml",
        ],
      },
      SET_MAX_TASK_DURATION: {
        actions: [
          assign({
            maxTaskDuration: (context, event) => event.value,
          }),
          "regenerateToml",
        ],
      },
      SET_FORWARDING_ALLOWED: {
        actions: [
          assign({
            forwardingAllowed: (context, event) => event.value === "true",
          }),
          "regenerateToml",
        ],
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
          "regenerateToml",
        ],
      },
      SET_JOB_TYPE_SPECIFIC_VARIABLES: {
        actions: [
          assign({
            jobTypeVariables: (context, event) => {
              let current = context.jobTypeVariables;

              if (event.value !== undefined)
                context.jobTypeVariables[event.jobType][event.variable].value =
                  event.value;

              if (event.values !== undefined)
                context.jobTypeVariables[event.jobType][event.variable].values =
                  event.values;

              // if (event.valid !== undefined)
              //   current[event.jobType][event.variable].valid = event.valid;

              return current;
            },
          }),
          // "validateJobTypeSpecificProps",
          // "regenerateToml"
        ],
      },
      STORE_TASK_RUN_RESULT: {
        actions: assign((context, event) => {
          console.log(event)
          return {
            taskRunResults: [
              ...context.taskRunResults,
              { id: event.nodeId, result: event.value },
            ],
          };
        }),
      },
      ADD_NEW_EDGE: {
        actions: [
          assign((context, event) => {
            const toAdd = {
              id: `edge_${context.totalEdgesAdded}`,
              ...event.newEdge,
            };

            return {
              edges: [...context.edges, toAdd],
              totalEdgesAdded: context.totalEdgesAdded + 1,
            };
          }),
          "regenerateToml",
        ],
      },
      REGENERATE_TOML: {
        actions: "regenerateToml",
      },
      PERSIST_STATE: {
        actions: [
          (context) => {

            // Extract any context props we don't want to persist
            const {
              reactFlowInstance,
              nodes,
              isConnecting,
              connectionParams,
              taskRunResults,
              parsedTaskOrder,
              parsingError,
              currentTaskIndex,
              jobLevelVars64,
              provider,
              openModals,
              ...toPersist } = context

            // Instead of saving the full context as-is, we'll expand the context of each spawned machine
            const parsedContext = {
              ...toPersist,
              nodes: {
                tasks: context.nodes.tasks.map((entry) => {

                  const { runResult, ...nodeContextToPersist } = entry.ref.getSnapshot()?.context || {}

                  return {
                    ...entry,
                    context: nodeContextToPersist,
                  }
                }),
                ai: context.nodes.ai.map((entry) => {

                  const { ...nodeContextToPersist } = entry.ref.getSnapshot()?.context || {}

                  return {
                    ...entry,
                    context: nodeContextToPersist,
                  }
                }),
              },
            };

            try {
              localStorage.setItem(
                "persisted-state",
                JSON.stringify(parsedContext)
              );
            } catch (e) {
              // unable to save to localStorage
            }
          },
        ],
      },
      RESTORE_STATE: {
        actions: assign((context, { savedContext }) => {
          return {
            ...context,
            ...savedContext,
            nodes: {
              ...context.nodes,
              tasks: savedContext.nodes.tasks.map((entry) => ({
                ...entry,
                // @ts-ignore
                ref: spawn(createTaskNodeMachine(entry.context || {}), entry.ref.id),
              })),
              ai: savedContext.nodes.ai.map((entry) => ({
                ...entry,
                // @ts-ignore
                ref: spawn(createAiNodeMachine(entry.context || {}), entry.ref.id),
              })),
            }
          };
        }),
      },
      OPEN_MODAL: {
        actions: assign((context, { name }) => {
          return {
            openModals: context.openModals.includes(name) ? context.openModals : [...context.openModals, name]
          }
        })
      },
      CLOSE_MODAL: {
        actions: assign((context, event) => {
          const { name } = event.data
          return {
            openModals: context.openModals.filter(entry => entry !== name)
          }
        })
      },
      // SET_NETWORK: {
      //   actions: [
      //     assign((context, event) => {
      //       return {
      //         network: event.value
      //       }
      //     })
      //   ]
      // }
    },
  },
  defaultWorkspaceMachineOptions
);

const getTaskNodeByCustomId = (context: WorkspaceContext, nodeId: string) =>
  context.nodes.tasks.find(
    (taskNode: any) => taskNode.ref.state.context.customId === nodeId
  );

const wrapVariable = (input: string) => `$(${input})`;

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
