import React, { useContext } from 'react';
import { EdgeProps, getBezierEdgeCenter, getBezierPath } from 'react-flow-renderer';
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Popover } from '../../components';
import { VarsDisplay } from './varsDisplay/VarsDisplay';

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

    return (
        <svg xmlns="http://www.w3.org/2000/svg">
            <defs>
                <path id={id} d={edgePath} />
            </defs>
            <use href={`#${id}`} className="react-flow__edge-path" />
            {sourceTaskRunResult && <svg xmlns="http://www.w3.org/2000/svg">
                <g>
                    <foreignObject
                        width={foreignObjectSize}
                        height={foreignObjectSize}
                        transform={`translate(-${foreignObjectSize / 2} -${foreignObjectSize / 2})`}>
                        <div className="h-full w-full flex items-center justify-center">
                            <Popover label={(open) => <label
                                tabIndex={0}
                                className={`shadow-widget border-gray-800 border-2 focus:border-2 fous:border-secondary hover:border-2 hover:border-secondary focus:border-secondary bg-base-100 h-8 w-8 min-h-0 btn btn-circle swap swap-rotate ${open ? "swap-active" : ""}`}
                            >
                                <EyeIcon className="swap-off h-5 w-5 text-white" />
                                <XMarkIcon className="swap-on h-5 w-5 text-white" />
                            </label>}
                                content={<VarsDisplay vars={sourceTaskRunResult.vars}/>} />
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
