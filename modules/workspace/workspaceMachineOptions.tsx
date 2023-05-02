import { MachineOptions, assign, send, actions } from "xstate";
import { WorkspaceContext, WorkspaceEvent, JOB_TYPES, TomlLine, TaskInstructions } from "./workspaceMachine"
import { TASK_TYPE } from "./taskNodeMachine"
import toml from "toml"
import { fromDot, NodeRef, attribute as _ } from "ts-graphviz"
import { toast } from "react-hot-toast"
import { ethers } from "ethers"
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export const workspaceMachineOptions: MachineOptions<WorkspaceContext, WorkspaceEvent> = {
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
                .then(res => res.json())
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
        saveJobSpecVersion: (context, event) => {

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
                },
            };

            return fetch("/api/job-specs/null/versions", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    content: parsedContext
                }),
            })
                .then(res => res.json().then(json => {
                    return json
                }))
        },
        // @ts-ignore
        importJobSpec: (context, event) => {
            const warnings = []
            try {
                if (!("content" in event)) {
                    throw new Error("'content' prop required on import_spec event")
                }

                const parsed = toml.parse(event.content)

                if (!("type" in parsed)) {
                    // throw new Error("'type' required in imported spec")
                    warnings.push("'type' property missing")
                }

                if (!JOB_TYPES.includes(parsed.type)) {
                    throw new Error("Invalid 'type' property in imported spec")
                }

                switch (parsed.type) {
                    case "cron":
                        {
                            if (!("schedule" in parsed)) {
                                warnings.push("'schedule' property missing")
                            }
                            else {
                                // TODO - Validate cron expression
                                // if invalid throw new Error("'schedule' property required for 'cron' jobs")
                            }
                        }
                }

                let constructedMachineContext: Partial<WorkspaceContext> = {
                    type: parsed.type,
                    name: parsed.name ?? "",
                    externalJobId: parsed.externalJobId ?? "",
                    // jobTypeSpecific: {
                    //   cron: {

                    //   }, // TODO
                    //   directrequest: {} // TODO
                    // },
                    // jobTypeVariables: TODO 
                    // toml: TODO
                }

                if (!("observationSource" in parsed)) {
                    // throw new Error("'observationSource' required in imported spec")
                    warnings.push("'observationSource' property missing")
                }
                else {
                    const input = `digraph {\n${parsed.observationSource}\n}`
                    const parsedObservationSrc = fromDot(input)

                    const nodesWithComputedIds = parsedObservationSrc.nodes.map((node, index) => {
                        return {
                            ...node,
                            computedId: `task_${index}`
                        }
                    })

                    constructedMachineContext.edges = parsedObservationSrc.edges.map((edge, index) => {

                        const sourceCustomId: string = (edge.targets[0] as NodeRef).id
                        const targetCustomId: string = (edge.targets[1] as NodeRef).id
                        const sourceWithComputedId = nodesWithComputedIds.find(entry => entry.id === sourceCustomId)
                        const targetWithComputedId = nodesWithComputedIds.find(entry => entry.id === targetCustomId)

                        return {
                            id: `edge_${index}`,
                            source: sourceWithComputedId ? sourceWithComputedId.computedId : "",
                            sourceCustomId: sourceCustomId,
                            target: targetWithComputedId ? targetWithComputedId.computedId : "",
                            targetCustomId: targetCustomId
                        }
                    })

                    constructedMachineContext.totalNodesAdded = parsedObservationSrc.nodes.length
                    constructedMachineContext.totalEdgesAdded = parsedObservationSrc.edges.length

                    constructedMachineContext.nodes = {
                        // @ts-ignore
                        tasks: nodesWithComputedIds.map((node, index) => {

                            // @ts-ignore
                            const taskSpecificNodeAttrs = node.attributes.values.filter(val => val[0] !== "type")

                            return {
                                ref: {
                                    id: node.computedId
                                },
                                context: {
                                    customId: node.id,
                                    coords: {
                                        x: 0, // TODO
                                        y: 0 // TODO
                                    },
                                    // @ts-ignore
                                    taskType: node.attributes.get("type")?.toString().toUpperCase(),
                                    incomingNodes: [], // TODO
                                    outgoingNodes: [], // TODO
                                    taskSpecific: taskSpecificNodeAttrs.reduce((acc, [key, value]) => {
                                        // @ts-ignore
                                        acc[key] = { raw: value, rich: value }; // TODO - format the 'rich' prop
                                        return acc;
                                    }, {}),
                                    mock: {
                                        mockResponseDataInput: "",
                                        mockResponseData: "",
                                        enabled: false
                                    },
                                    isValid: true
                                }
                            }
                        })
                    }
                }

                return Promise.resolve({ constructedMachineContext, warnings })
            }
            catch (err) {
                return Promise.reject({ error: err, warnings })
            }
        }
    },
    actions: {
        createImportToast: (context, event) => {
            // @ts-ignore
            const { warnings, error } = event.data

            if (error) {
                toast.error(error.message ?? "An error occurred")
            }
            else if (!warnings || warnings.length < 1) {
                toast.success("Import successful")
            }
            else {
                toast.custom((t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-base-100 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-secondary`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-center gap-4">
                                <ExclamationTriangleIcon className="h-8 w-8"></ExclamationTriangleIcon>
                                <div className="flex flex-col gap-4">
                                    <p className="uppercase text-sm font-bold tracking-wider text-gray-400">
                                        Import partially successful
                                    </p>
                                    <div className="flex flex-col gap-2 text-sm">
                                        <p className="">
                                            We imported as much as possible but there were some issues:
                                        </p>
                                        <ul className="flex flex-col gap-2 p-4 list-disc">
                                            {
                                                warnings.map((warning: string) => <li>{warning}</li>)
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-300">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ))
            }
        },
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
        processCurrentTask: actions.pure((context: WorkspaceContext, _) => {
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