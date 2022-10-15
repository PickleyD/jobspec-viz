import React from "react";
import {
  ConnectionLineComponentProps,
  getBezierPath,
  Position,
} from "react-flow-renderer";
import { snapToGrid, NODE_WIDTH } from "./Flow";

const PLACEHOLDER_HEIGHT = 100;
const PLACEHOLDER_RADIUS = 8;
const PLACEHOLDER_STROKE_WIDTH = 4;

export const CustomConnectionLine = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  fromHandle,
}: ConnectionLineComponentProps) => {
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
