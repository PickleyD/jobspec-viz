import { Handle, NodeProps, Position } from "react-flow-renderer";

export const TaskNode = ({ id }: NodeProps) => {
  return (
    <div className="bg-indigo-900 p-4 rounded-sm">
      <Handle type="target" position={Position.Left} />
      <div>{id}</div>
    </div>
  );
};