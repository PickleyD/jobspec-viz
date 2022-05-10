import { Handle, NodeProps, Position } from "react-flow-renderer";
import React from "react";
import { useSelector } from "@xstate/react";

const customIdSelector = (state: any) => state.context.customId;

type TaskNodeProps = NodeProps & {
  useDefaultHandles?: boolean;
  children?: React.ReactNode;
};

export const TaskNode = ({
  id,
  data,
  useDefaultHandles = true,
  children,
}: TaskNodeProps) => {
  const { machine } = data;

  const customId = useSelector(machine, customIdSelector);

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    machine.send("SET_CUSTOM_ID", { value: newValue });
  };

  return (
    <div className="bg-blue-500 p-4 rounded-sm">
      {useDefaultHandles && (
        <>
          <Handle type="target" position={Position.Top} />
          <Handle type="source" position={Position.Bottom} />
        </>
      )}
      <div className="text-xl font-bold">{data.label}</div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Task ID</span>
        </label>
        <input
          value={customId}
          onChange={handleCustomIdChange}
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      {children}
    </div>
  );
};
