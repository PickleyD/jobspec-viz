import { createMachine, assign } from "xstate";
import { sendParent } from "xstate/lib/actions";
import { XYCoords, NodeContext } from "./node"
import { TomlLine } from "./workspaceMachine";

export type AiNodeEvent =
    | { type: "ADD_INCOMING_NODE"; nodeId: string }
    | { type: "ADD_OUTGOING_NODE"; nodeId: string }
    | { type: "UPDATE_INCOMING_NODE"; nodeId: string; prevNodeId: string; }
    | { type: "UPDATE_OUTGOING_NODE"; nodeId: string; prevNodeId: string; }
    | { type: "REMOVE_INCOMING_NODE"; nodeId: string }
    | { type: "REMOVE_OUTGOING_NODE"; nodeId: string }
    | { type: "UPDATE_COORDS"; value: XYCoords }
    | { type: "SET_PROMPT"; value: string }
    | { type: "PROCESS_PROMPT", toml: Array<TomlLine>};

export interface AiNodeContext extends NodeContext {
    id: string;
    prompt: string;
    promptResult: any;
}

const defaultContext: AiNodeContext = {
    id: "aiPrompt-0",
    coords: { x: 0, y: 0 },
    incomingNodes: [],
    outgoingNodes: [],
    prompt: "",
    promptResult: undefined
};

export const createAiNodeMachine = (
    initialContext: Partial<AiNodeContext>
) => {
    const fullInitialContext = {
        ...defaultContext,
        ...initialContext,
    };

    return createMachine<AiNodeContext, AiNodeEvent>(
        {
            id: "aiPrompt",
            context: {
                ...fullInitialContext
            },
            initial: "idle",
            states: {
                idle: {
                    on: {
                        PROCESS_PROMPT: {
                            target: "running"
                        },
                        SET_PROMPT: {
                            actions: assign({
                                prompt: (context, event) => event.value,
                            })
                        }
                    }
                },

                running: {
                    invoke: {
                        src: "submitAiPrompt",
                        id: "submitAiPrompt",
                        onDone: {
                            target: "inspectingResult",
                            actions: [
                                assign((_, event) => ({
                                    promptResult: event.data
                                })),
                            ]
                        },
                        onError: { target: "error" }
                    }
                },
                inspectingResult: {
                    always: [
                        { target: "error", cond: "resultHasError" },
                        { target: "success" }
                    ]
                },
                success: {
                    entry: ["TODO:successToast", sendParent((context, event) => ({
                        value: context.promptResult.choices[0].message.content,
                        parentNodes: context.incomingNodes,
                        childNodes: context.outgoingNodes,
                        aiNodeId: context.id,
                        type: "HANDLE_AI_PROMPT_COMPLETION"
                    }))]
                },
                error: {
                    entry: ["TODO:errorToast"]
                },
            },
            on: {
                ADD_INCOMING_NODE: {
                    actions: [
                        assign({
                            incomingNodes: (context, event) => [
                                ...context.incomingNodes,
                                event.nodeId,
                            ],
                        }),
                    ],
                },
                ADD_OUTGOING_NODE: {
                    actions: [
                        assign({
                            outgoingNodes: (context, event) => [
                                ...context.outgoingNodes,
                                event.nodeId,
                            ],
                        }),
                    ],
                },
                REMOVE_INCOMING_NODE: {
                    actions: [
                        assign({
                            incomingNodes: (context, event) =>
                                context.incomingNodes.filter(
                                    (incomingNode: string) => incomingNode !== event.nodeId
                                ),
                        })
                    ],
                },
                REMOVE_OUTGOING_NODE: {
                    actions: [
                        assign({
                            outgoingNodes: (context, event) =>
                                context.outgoingNodes.filter(
                                    (outgoingNode: string) => outgoingNode !== event.nodeId
                                ),
                        }),
                    ],
                },
                UPDATE_INCOMING_NODE: {
                    actions: [
                        assign({
                            incomingNodes: (context, event) =>
                                context.incomingNodes.map(incomingNode => incomingNode === event.prevNodeId ? event.nodeId : incomingNode)
                        }),
                    ]
                },
                UPDATE_OUTGOING_NODE: {
                    actions: [
                        assign({
                            outgoingNodes: (context, event) =>
                                context.outgoingNodes.map(outgoingNode => outgoingNode === event.prevNodeId ? event.nodeId : outgoingNode)
                        }),
                    ]
                },
                UPDATE_COORDS: {
                    actions: [
                        assign({
                            coords: (_, event) => (event.value),
                        })
                    ],
                }
            },
        },
        {
            actions: {
            },
            services: {
                submitAiPrompt: (context, event) => {
                    if (!("toml" in event)) {
                        throw new Error(`'toml' prop required on event triggering submitAiPrompt fn`)
                    } 

                    const currentToml = event.toml.reduce((prev, curr) => prev + `\n${curr.value}`, ``)

                    return fetch("/api/generate", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(
                            {
                                prompt: context.prompt,
                                toml: currentToml,
                                aiNodeId: context.id
                            }
                        )
                    })
                        .then(res => res.json().then(json => {
                            console.log(json)
                            return res.ok ? json : {
                                error: json.error.message
                            }
                        }))
                },
            },
            guards: {
                resultHasError: (context, event) => {
                    return context.promptResult.error
                },
            }
        },
    );
};
