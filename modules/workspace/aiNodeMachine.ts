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
  | { type: "UPDATE_COORDS"; value: XYCoords };

export interface AiNodeContext extends NodeContext {
    promptResult: any;
}

const defaultContext: AiNodeContext = {
    coords: { x: 0, y: 0 },
    incomingNodes: [],
    outgoingNodes: [],
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
                                }))
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

                },
                error: {

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
                    console.log(context)
                    console.log(event)
                    //   return fetch("/api/generate", {
                    //     method: "POST",
                    //     headers: {
                    //       'Accept': 'application/json',
                    //       'Content-Type': 'application/json'
                    //     },
                    //     body: JSON.stringify(
                    //       {
                    //         // TODO
                    //       }
                    //     )
                    //   })
                    //     .then(res => res.json().then(json => {
                    //       return res.ok ? json : {
                    //         error: json.error.message
                    //       }
                    //     }))

                    return Promise.resolve()
                },
            },
            guards: {
            }
        },
    );
};
