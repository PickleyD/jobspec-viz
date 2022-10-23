import React, { useContext } from 'react';
import { EdgeProps, getBezierEdgeCenter, getBezierPath } from 'react-flow-renderer';
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useEffect } from "react";

const sourceTaskRunResultSelector = (state: any, sourceId?: string) => {
    if (!sourceId) return

    const fromNodeTaskMachine = state.context.nodes.tasks.find((task: any) => task.ref.id === sourceId)?.ref;

    return fromNodeTaskMachine?.state.context.runResult
}

const foreignObjectSize = 30;

const onEdgeClick = (evt: any, id: string) => {
    evt.stopPropagation();
    alert(`remove ${id}`);
};

export const CustomEdge = ({
    id,
    source,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
}: EdgeProps) => {
    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const [labelX, labelY] = getBezierEdgeCenter({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const globalServices = useContext(GlobalStateContext);

    const sourceTaskRunResult = useSelector(
        globalServices.workspaceService,
        (state: any) => sourceTaskRunResultSelector(state, source)
    );

    useEffect(() => {
        console.log(sourceTaskRunResult)
    }, [sourceTaskRunResult])

    return (
        <>
            <svg xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <path id={id} d={edgePath} />
                </defs>
                <use href={`#${id}`} className="react-flow__edge-path" />
                {sourceTaskRunResult && <svg xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <foreignObject
                            requiredExtensions="http://www.w3.org/1999/xhtml"
                            width={foreignObjectSize}
                            height={foreignObjectSize}
                            transform={`translate(-${foreignObjectSize / 2} -${foreignObjectSize / 2})`}>
                            <div data-xmlns="http://www.w3.org/1999/xhtml" className="h-full w-full flex items-center justify-center bg-secondary rounded-full">
                                <button className="edgebutton" onClick={(event) => onEdgeClick(event, id)}>
                                    ×
                                </button>
                            </div>
                        </foreignObject>
                        <animateMotion id="motion" rotate="0" begin="0s" dur="500ms"
                            end="250ms" keyPoints=".50;.50" keyTimes="0;1" fill="freeze">
                            <mpath href={`#${id}`} />
                        </animateMotion>
                    </g>
                </svg>}
            </svg>
        </>
    );
}
