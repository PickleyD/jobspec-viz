import { ethers } from "ethers";
import { createMachine, assign, send, actions } from "xstate";
import { sendParent } from "xstate/lib/actions";
import { XYCoords, NodeContext } from "./node"

export type AiNodeEvent =
    | { type: "ADD_INCOMING_NODE"; nodeId: string }
    | { type: "ADD_OUTGOING_NODE"; nodeId: string }
    | { type: "UPDATE_INCOMING_NODE"; nodeId: string; prevNodeId: string; }
    | { type: "UPDATE_OUTGOING_NODE"; nodeId: string; prevNodeId: string; }
    | { type: "REMOVE_INCOMING_NODE"; nodeId: string }
    | { type: "REMOVE_OUTGOING_NODE"; nodeId: string }
    | { type: "UPDATE_COORDS"; value: XYCoords }
    | { type: "SET_PROMPT"; value: string }
    | { type: "PROCESS_PROMPT" };

export interface AiNodeContext extends NodeContext {
    prompt: string;
    promptResult: any;
}

const defaultContext: AiNodeContext = {
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
                        type: "HANDLE_AI_PROMPT_COMPLETION"
                    })),]
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
                    return fetch("/api/generate", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(
                            {
                                prompt: context.prompt
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
