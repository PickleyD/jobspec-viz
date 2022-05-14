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
    <div className="bg-blue-500 p-4 rounded-sm relative cursor-default">
      <div className="custom-drag-handle absolute top-0 right-0 h-10 w-8 flex items-center justify-center cursor-grab">
        <svg xmlns="http://www.w3.org/2000/svg" className="fill-current" height="28" viewBox="0 0 24 24" width="28"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
      </div>
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
