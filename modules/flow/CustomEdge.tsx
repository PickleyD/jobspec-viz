import React, { useContext } from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useEffect } from "react";

const sourceTaskRunResultSelector = (state: any, sourceId?: string) => {
    if (!sourceId) return

    const fromNodeTaskMachine = state.context.nodes.tasks.find((task: any) => task.ref.id === sourceId)?.ref;

    return fromNodeTaskMachine?.state.context.runResult
}

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
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            {
                sourceTaskRunResult &&
                <text>
                    <textPath
                        href={`#${id}`}
                        style={{ fontSize: '12px' }}
                        startOffset="50%"
                        textAnchor="middle"
                    >
                        {JSON.stringify(sourceTaskRunResult)}
                    </textPath>
                </text>
            }
        </>
    );
}
