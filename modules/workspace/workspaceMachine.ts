import {
  createMachine,
  spawn,
  assign,
  send,
  actions,
  ActorRefFrom,
  StateMachine,
} from "xstate";
import {
  createTaskNodeMachine,
  TaskNodeOptions,
  TaskNodeContext,
  TaskNodeEvent,
  TASK_TYPE,
  XYCoords,
} from "./taskNodeMachine";
import {
  Edge,
  OnConnectStartParams,
  ReactFlowInstance,
} from "react-flow-renderer";
import { isAddress } from "ethers/lib/utils";
import Web3 from "web3";
import { ethers } from "ethers";

type CustomEdge = Edge & { sourceCustomId: string; targetCustomId: string };
export type NEW_NODE_TYPE = "source" | "target";

type WorkspaceEvent =
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
  | { type: "SKIP_CURRENT_SIDE_EFFECT" };

interface WorkspaceContext {
  reactFlowInstance: ReactFlowInstance | null;
  type: JOB_TYPE;
  name: string;
  externalJobId: string;
  gasLimit: string;
  maxTaskDuration: string;
  forwardingAllowed: boolean;
  edges: CustomEdge[];
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
}

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

type TaskInstructions = {
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

type Nodes = {
  tasks: Array<{
    ref: ActorRefFrom<StateMachine<TaskNodeContext, any, TaskNodeEvent>>;
  }>;
};

export type TomlLine = {
  value: string;
  valid?: boolean;
  isObservationSrc?: boolean;
};

export type JOB_TYPE = "cron" | "directrequest";

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

const validateAddress = (input: string) => isAddress(input);

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
        on: {
          TOGGLE_TEST_MODE: {
            target: "testModeLoading",
          },
        },
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
      },
      isConnecting: false,
      connectionParams: { nodeId: null, handleId: null, handleType: null },
      taskRunResults: [],
      toml: [],
      parsedTaskOrder: [],
      parsingError: "",
      currentTaskIndex: 0,
      jobLevelVars64: undefined,
      provider: getProvider()
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
      DELETE_TASK_NODE: {
        actions: [
          assign({
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
      CONNECTION_SUCCESS: {
        actions: ["addTaskNode", "regenerateToml"],
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
              tasks: savedContext.nodes.tasks.map((entry) => ({
                ...entry,
                // @ts-ignore
                ref: spawn(createTaskNodeMachine(entry.context || {}), entry.ref.id),
              })),
            }
          };
        }),
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
  {
    guards: {
      hasParsingError: (context, event) => {
        return context.parsingError.length > 0
      }
    },
    services: {
      parseSpec: (context, event) => {

        return fetch("/api/graph", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            spec: `${context.toml
              .filter((line) => line.isObservationSrc)
              .map((line) => line.value)
              .join("\n")}`,
          }),
        })
          .then(res => res.json().then(json => {
            return json
          }))
      },
      processJobLevelVariables: (context, event) => {
        return fetch("/api/var-helper", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              // TODO: Need to prepend with jobSpec instead of jobRun for non job-specific variables
              jobRun: Object.fromEntries(Object.entries(context.jobTypeVariables[context.type]).map(([k, v]) => {

                return [k, ({
                  ...v.values !== undefined && { values: v.values },
                  ...(v.values === undefined && v.value !== undefined) && { value: v.value },
                  type: v.type || "string",
                  fromType: v.fromType || "string"
                })]
              }))
            }
          )
        })
          .then(res => res.json().then(json => {
            return res.ok ? json : Promise.reject(json);
          })
          );
      },
    },
    actions: {
      // @ts-ignore
      setCurrentTaskPendingRun: actions.pure((context, _) => {
        if (context.currentTaskIndex >= context.parsedTaskOrder.length) return;

        const currentTask = context.parsedTaskOrder[context.currentTaskIndex];
        const currentTaskCustomId = currentTask.id;

        const currentTaskId = getTaskNodeByCustomId(
          context,
          currentTaskCustomId
        )?.ref.id;

        return [send({ type: "SET_PENDING_RUN" }, { to: currentTaskId })];
      }),
      // @ts-ignore
      resetNextTask: actions.pure((context, _) => {
        const nextTaskIndex = context.currentTaskIndex + 1;

        if (nextTaskIndex >= context.parsedTaskOrder.length) return;

        const nextTask = context.parsedTaskOrder[context.currentTaskIndex + 1];
        const nextTaskCustomId = nextTask.id;

        const nextTaskId = getTaskNodeByCustomId(context, nextTaskCustomId)?.ref
          .id;

        return [send({ type: "RESET" }, { to: nextTaskId })];
      }),
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
      // @ts-ignore
      processCurrentTask: actions.pure((context, _) => {
        if (context.currentTaskIndex >= context.parsedTaskOrder.length) return;

        // Try to execute the current task and then proceed if successful
        const currentTask: TaskInstructions = context.parsedTaskOrder[context.currentTaskIndex];
        const currentTaskCustomId = currentTask.id;

        const currentTaskId = getTaskNodeByCustomId(
          context,
          currentTaskCustomId
        )?.ref.id;

        const input64s = currentTask.inputs
          .filter((input) => input.propagateResult === true)
          .map(
            (input) =>
              context.taskRunResults.find((trr) => trr.id === input.id)?.result
                .val64
          );

        const vars64 =
          context.taskRunResults.length > 0
            ? context.taskRunResults[context.taskRunResults.length - 1].result
              .vars64
            : context.jobLevelVars64;
            
        return [
          send(
            { type: "TRY_RUN_TASK", input64s, vars64 },
            { to: currentTaskId }
          ),
        ];
      }),
      // @ts-ignore
      executeCurrentSideEffect: actions.pure((context, event) => {
        if (context.currentTaskIndex >= context.parsedTaskOrder.length) return;

        // Try to execute the current task and then proceed if successful
        const currentTask = context.parsedTaskOrder[context.currentTaskIndex];
        const currentTaskCustomId = currentTask.id;

        const currentTaskId = getTaskNodeByCustomId(
          context,
          currentTaskCustomId
        )?.ref.id;

        return [
          send(
            { type: "TRY_RUN_SIDE_EFFECT", provider: context.provider },
            { to: currentTaskId }
          ),
        ]
      }),
      // @ts-ignore
      skipCurrentSideEffect: actions.pure((context, event) => {
        if (context.currentTaskIndex >= context.parsedTaskOrder.length) return;

        // Skip the current task
        const currentTask = context.parsedTaskOrder[context.currentTaskIndex];
        const currentTaskCustomId = currentTask.id;

        const currentTaskId = getTaskNodeByCustomId(
          context,
          currentTaskCustomId
        )?.ref.id;

        return [
          send(
            { type: "SKIP_SIDE_EFFECT" },
            { to: currentTaskId }
          ),
        ]
      }),
      regenerateToml: assign((context, event) => {

        const { type: jobType, name, externalJobId, gasLimit, maxTaskDuration, forwardingAllowed } = context;

        const lines: Array<TomlLine> = [];

        lines.push(
          { value: `type = "${jobType}"` },
          { value: `schemaVersion = 1` }
        );
        name && lines.push({ value: `name = "${name}"` });
        externalJobId &&
          lines.push({ value: `externalJobId = "${externalJobId}"` });

        gasLimit &&
        lines.push({ value: `gasLimit = "${gasLimit}"` });

        maxTaskDuration &&
          lines.push({ value: `maxTaskDuration = "${maxTaskDuration}"` });

        forwardingAllowed &&
        lines.push({ value: `forwardingAllowed = "${forwardingAllowed}"` });

        switch (jobType) {
          case "cron": {
            const { value, valid } = context.jobTypeSpecific.cron.schedule;
            lines.push({ value: `schedule = "CRON_TZ=UTC ${value}"`, valid });
            break;
          }
          case "directrequest": {
            const { value: contractAddress, valid: contractAddressValid } =
              context.jobTypeSpecific.directrequest.contractAddress;
            const {
              value: minContractPaymentLinkJuels,
              valid: minContractPaymentLinkJuelsValid,
            } =
              context.jobTypeSpecific.directrequest.minContractPaymentLinkJuels;
            const {
              value: minIncomingConfirmations,
              valid: minIncomingConfirmationsValid,
            } = context.jobTypeSpecific.directrequest.minIncomingConfirmations;
            lines.push({
              value: `contractAddress = "${contractAddress}"`,
              valid: contractAddressValid,
            });
            minContractPaymentLinkJuels !== "" &&
              lines.push({
                value: `minContractPaymentLinkJuels = "${minContractPaymentLinkJuels}"`,
                valid: minContractPaymentLinkJuelsValid,
              });
            minIncomingConfirmations !== "" &&
              lines.push({
                value: `minIncomingConfirmations = ${minIncomingConfirmations}`,
                valid: minIncomingConfirmationsValid,
              });
            break;
          }
          default:
            break;
        }

        lines.push({ value: `` });

        lines.push({ value: `observationSource = """` });

        const observationSrcLines: Array<TomlLine> = [];

        context.nodes.tasks.forEach((task) => {
          const { customId, taskType, taskSpecific, incomingNodes, isValid } =
            task.ref.state.context;

          const spacer = new Array(customId ? customId.length + 1 : 0).join(
            " "
          );

          switch (taskType) {
            case "HTTP": {
              const processedRequestData = taskSpecific.requestData?.raw
                ? taskSpecific.requestData?.raw
                  .replace(/\s/g, "")
                  .replace(/"/g, `\\\"`)
                : "";

              observationSrcLines.push(
                { value: `${customId} [type="http"`, valid: isValid },
                {
                  value: `${spacer}  method=${taskSpecific.method?.raw || "GET"}`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  url="${taskSpecific.url?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  requestData="${processedRequestData}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "BRIDGE": {
              const processedRequestData = taskSpecific.requestData?.raw
                ? taskSpecific.requestData?.raw
                  .replace(/\s/g, "")
                  .replace(/"/g, `\\\"`)
                : "";

              observationSrcLines.push(
                { value: `${customId} [type="bridge"`, valid: isValid },
                {
                  value: `${spacer}  name="${taskSpecific.name?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  requestData="${processedRequestData}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  async="${taskSpecific.async?.raw || "no"}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "JSONPARSE": {

              const processedData = taskSpecific.data?.raw
                ? taskSpecific.data?.raw
                  .replace(/\s/g, "")
                  .replace(/"/g, `\\\"`)
                : "";

              observationSrcLines.push(
                { value: `${customId} [type="jsonparse"`, valid: isValid },
                {
                  value: `${spacer}  data="${processedData}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  path="${taskSpecific.path?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "CBORPARSE": {
              observationSrcLines.push(
                { value: `${customId} [type="cborparse"`, valid: isValid },
                {
                  value: `${spacer}  data="${taskSpecific.data?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  mode="${taskSpecific.mode?.raw || "diet"}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "ETHTX": {
              observationSrcLines.push(
                { value: `${customId} [type="ethtx"`, valid: isValid },
                {
                  value: `${spacer}  to="${taskSpecific.to?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  data="${taskSpecific.data?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "ETHCALL": {
              observationSrcLines.push(
                { value: `${customId} [type="ethcall"`, valid: isValid },
                {
                  value: `${spacer}  contract="${taskSpecific.contract?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  data="${taskSpecific.data?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "SUM": {
              observationSrcLines.push(
                { value: `${customId} [type="sum"`, valid: isValid },
                {
                  value: `${spacer}  values=<${taskSpecific.values?.raw || ""}>${taskSpecific.allowedFaults?.raw ? "" : "]"
                    }`,
                  valid: isValid,
                }
              );
              taskSpecific.allowedFaults &&
                observationSrcLines.push({
                  value: `${spacer}  allowedFaults=${taskSpecific.allowedFaults?.raw}]`,
                  valid: isValid,
                });
              break;
            }
            case "MULTIPLY": {
              observationSrcLines.push(
                { value: `${customId} [type="multiply"`, valid: isValid },
                {
                  value: `${spacer}  input="${taskSpecific.input?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  times="${taskSpecific.times?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "DIVIDE": {
              observationSrcLines.push(
                { value: `${customId} [type="divide"`, valid: isValid },
                {
                  value: `${spacer}  input="${taskSpecific.input?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  divisor="${taskSpecific.divisor?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  precision="${taskSpecific.precision?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "ANY": {
              observationSrcLines.push({
                value: `${customId} [type="any"]`,
                valid: isValid,
              });
              break;
            }
            case "MEAN": {
              observationSrcLines.push(
                { value: `${customId} [type="mean"`, valid: isValid },
                {
                  value: `${spacer}  values=<[ ${incomingNodes
                    .map(wrapVariable)
                    .join(", ")} ]>`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  precision=${taskSpecific.precision?.raw || 2}]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "MODE": {
              observationSrcLines.push(
                { value: `${customId} [type="mode"`, valid: isValid },
                {
                  value: `${spacer}  values=<[ ${incomingNodes
                    .map(wrapVariable)
                    .join(", ")} ]>]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "MEDIAN": {
              observationSrcLines.push(
                { value: `${customId} [type="median"`, valid: isValid },
                {
                  value: `${spacer}  values=<[ ${incomingNodes
                    .map(wrapVariable)
                    .join(", ")} ]>]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "ETHABIDECODELOG": {
              observationSrcLines.push(
                { value: `${customId} [type="ethabidecodelog"`, valid: isValid },
                { value: `${spacer}  abi="${taskSpecific.abi?.raw || ""}"`, valid: isValid },
                { value: `${spacer}  data="${taskSpecific.data?.raw || ""}"`, valid: isValid },
                { value: `${spacer}  topics="${taskSpecific.topics?.raw || ""}"]`, valid: isValid },
              )
              break;
            }
            case "ETHABIDECODE": {
              observationSrcLines.push(
                { value: `${customId} [type="ethabidecode"`, valid: isValid },
                { value: `${spacer}  abi="${taskSpecific.abi?.raw || ""}"`, valid: isValid },
                { value: `${spacer}  data="${taskSpecific.data?.raw || ""}"]`, valid: isValid },
              )
              break;
            }
            case "ETHABIENCODE": {
              const processedData = taskSpecific.data?.raw
                ? taskSpecific.data?.raw
                  // .replace(/\s/g, "")
                  .replace(/"/g, `\\\"`)
                : "";

              observationSrcLines.push(
                { value: `${customId} [type="ethabiencode"`, valid: isValid },
                { value: `${spacer}  abi="${taskSpecific.abi?.raw || ""}"`, valid: isValid },
                { value: `${spacer}  data="${processedData}"]`, valid: isValid },
              )
              break;
            }
            case "LESSTHAN": {
              observationSrcLines.push(
                { value: `${customId} [type="lessthan"`, valid: isValid },
                {
                  value: `${spacer}  left="${taskSpecific.input?.raw || ""}"`,
                  valid: isValid,
                },
                {
                  value: `${spacer}  right="${taskSpecific.limit?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "LENGTH": {
              observationSrcLines.push(
                { value: `${customId} [type="length"`, valid: isValid },
                {
                  value: `${spacer}  input="${taskSpecific.input?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
            case "LOOKUP": {
              observationSrcLines.push(
                { value: `${customId} [type="lookup"`, valid: isValid },
                {
                  value: `${spacer}  key="${taskSpecific.key?.raw || ""}"]`,
                  valid: isValid,
                }
              );
              break;
            }
          }
        });

        context.edges.length > 0 && observationSrcLines.push({ value: `` });

        context.edges.map((edge) => {
          observationSrcLines.push({
            value: `${edge.sourceCustomId} -> ${edge.targetCustomId}`,
          });
        });

        lines.push(
          ...observationSrcLines.map((line) => ({
            ...line,
            isObservationSrc: true,
          }))
        );

        lines.push({ value: `"""` });

        return {
          toml: lines,
        };
      }),
    },
  }
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
