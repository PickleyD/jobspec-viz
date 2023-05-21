import React, { useContext } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { CameraIcon } from '@heroicons/react/24/outline';
import { VarsDisplay } from './varsDisplay/VarsDisplay';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const sourceTaskRunResultSelector = (state: any, sourceId?: string) => {
    if (!sourceId) return

    const fromNodeTaskMachine = state.context.nodes.tasks.find((task: any) => task.ref.id === sourceId)?.ref;

    return fromNodeTaskMachine?.state.context.runResult
}

const foreignObjectSize = 100;

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
    const [edgePath, labelX, labelY] = getBezierPath({
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

    return (
        <svg xmlns="http://www.w3.org/2000/svg">
            <defs>
                <path id={id} d={edgePath} className="stroke-foreground" />
            </defs>
            <use href={`#${id}`} className="react-flow__edge-path" />
            {sourceTaskRunResult && <svg xmlns="http://www.w3.org/2000/svg">
                <g>
                    <foreignObject
                        width={foreignObjectSize}
                        height={foreignObjectSize}
                        transform={`translate(-${foreignObjectSize / 2} -${foreignObjectSize / 2})`}>
                        <div className="h-full w-full flex items-center justify-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="secondary" className="w-6 h-6 rounded-full p-0">
                                        <CameraIcon className="h-4 w-4" />
                                        <span className="sr-only">Open task selector</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <VarsDisplay vars={sourceTaskRunResult.vars} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </foreignObject>
                    <animateMotion id="motion" rotate="0" begin="0s" dur="500ms"
                        end="250ms" keyPoints=".50;.50" keyTimes="0;1" fill="freeze">
                        <mpath href={`#${id}`} />
                    </animateMotion>
                </g>
            </svg>}
        </svg>
    );
}
