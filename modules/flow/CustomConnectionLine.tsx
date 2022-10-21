import React, { useContext } from "react";
import {
  ConnectionLineComponentProps,
  getBezierPath,
  Position,
} from "react-flow-renderer";
import { snapToGrid, NODE_WIDTH } from "./Flow";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useEffect } from "react";

const PLACEHOLDER_HEIGHT = 100;
const PLACEHOLDER_RADIUS = 8;
const PLACEHOLDER_STROKE_WIDTH = 4;

const fromNodeTaskRunResultSelector = (state: any, fromNodeId?: string) => {
  if (!fromNodeId) return

  const fromNodeTaskMachine = state.context.nodes.tasks.find((task: any) => task.ref.id === fromNodeId)?.ref; 

  return fromNodeTaskMachine?.state.context.runResult
}

export const CustomConnectionLine = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  fromHandle,
  fromNode
}: ConnectionLineComponentProps) => {

  const globalServices = useContext(GlobalStateContext);

  const fromNodeTaskRunResult = useSelector(
    globalServices.workspaceService,
    (state: any) => fromNodeTaskRunResultSelector(state, fromNode?.id)
  );

  useEffect(() => {
    console.log(fromNodeTaskRunResult)
  }, [fromNodeTaskRunResult])

  // If fromHandle.position is bottom this means a connection is being drawn from the bottom of a node
  const isForwardsConnection = fromHandle?.position === Position.Bottom;

  // In a backwards connection sourceX, sourceY are the changing coordinates, so snap them
  const { snappedX: snappedSourceX, snappedY: snappedSourceY } =
    isForwardsConnection
      ? { snappedX: sourceX, snappedY: sourceY }
      : snapToGrid({
          x: sourceX,
          y: sourceY,
        });

  // In a forwards connection targetX, targetY are the changing coordinates, so snap them
  const { snappedX: snappedTargetX, snappedY: snappedTargetY } =
    isForwardsConnection
      ? snapToGrid({
          x: targetX,
          y: targetY,
        })
      : { snappedX: targetX, snappedY: targetY };

  const pathParams = {
    sourceX: snappedSourceX,
    sourceY: snappedSourceY,
    sourcePosition,
    targetX: snappedTargetX,
    targetY: snappedTargetY,
    targetPosition,
  };

  return (
    <>
      <g>
        <path
          fill="none"
          stroke="#fff"
          strokeWidth={PLACEHOLDER_STROKE_WIDTH}
          d={getBezierPath(pathParams)}
        />
        <rect
          x={
            (isForwardsConnection ? snappedTargetX : snappedSourceX) -
            NODE_WIDTH / 2 +
            PLACEHOLDER_STROKE_WIDTH / 2
          }
          y={
            (isForwardsConnection ? snappedTargetY : snappedSourceY - PLACEHOLDER_HEIGHT) +
            PLACEHOLDER_STROKE_WIDTH / 2
          }
          width={NODE_WIDTH - PLACEHOLDER_STROKE_WIDTH}
          height={PLACEHOLDER_HEIGHT}
          rx={PLACEHOLDER_RADIUS}
          ry={PLACEHOLDER_RADIUS}
          className={`fill-black/25 stroke-black/50 stroke-[4px]`}
        />
        <circle cx={isForwardsConnection ? snappedTargetX : snappedSourceX} cy={isForwardsConnection ? snappedTargetY : snappedSourceY} fill="#fff" r={10} />
      </g>
    </>
  );
};
