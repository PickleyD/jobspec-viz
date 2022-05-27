import { Handle, NodeProps, Position } from "react-flow-renderer";
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { TrashIcon } from "@heroicons/react/solid";

const nodesSelector = (state: any) => state.context.nodes;

const customIdSelector = (state: any) => state.context.customId;
const outgoingNodesSelector = (state: any) => state.context.outgoingNodes;

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

  const [prevCustomId, setPrevCustomId] = useState<string>()
  const customId = useSelector(machine, customIdSelector);
  const outgoingNodeIds = useSelector(machine, outgoingNodesSelector);

  const globalServices = useContext(GlobalStateContext);
  const nodesFromMachine = useSelector(
    globalServices.workspaceService,
    nodesSelector
  );

  const isUniqueTaskId = (taskId: string) => {
    return getTaskNodeByCustomId(taskId) === undefined
  }

  const [tempCustomId, setTempCustomId] = useState<string>(customId)
  const [customIdError, setCustomIdError] = useState<boolean>(false)

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setTempCustomId(newValue)

    // only update in the machine if it's a unique task ID
    if (isUniqueTaskId(newValue)) {

      setCustomIdError(false)

      // cache prev custom ID so we know which to update on outgoing nodes
      setPrevCustomId(customId)

      machine.send("SET_CUSTOM_ID", { value: newValue });
    }
    else {
      setCustomIdError(true)
    }
  };

  const getTaskNodeById = (nodeId: string) =>
    nodesFromMachine.tasks.find((taskNode: any) => taskNode.ref.id === nodeId);

  const getTaskNodeByCustomId = (nodeId: string) =>
    nodesFromMachine.tasks.find((taskNode: any) => taskNode.ref.state.context.customId === nodeId);

  const updateExistingConnections = () => {

    const outgoingNodes = outgoingNodeIds.map((nodeId: string) => getTaskNodeById(nodeId))

    outgoingNodes.map((outgoingNode: any) => {
      outgoingNode.ref.send("UPDATE_INCOMING_NODE", {
        nodeId: customId,
        prevNodeId: prevCustomId
      })
    })
  };

  const updateStoredEdges = () => {
    globalServices.workspaceService.send("UPDATE_EDGES_WITH_NODE_ID", {
      nodeId: customId,
      prevNodeId: prevCustomId
    })
  }

  useEffect(() => {
    updateExistingConnections()
    updateStoredEdges()
  }, [customId])

  const notifyExistingConnectionsOfDeletion = () => {

    const outgoingNodes = outgoingNodeIds.map((nodeId: string) => getTaskNodeById(nodeId))

    outgoingNodes.map((outgoingNode: any) => {
      outgoingNode.ref.send("REMOVE_INCOMING_NODE", {
        nodeId: customId
      })
    })
  };

  const handleDeleteNode = () => {
    notifyExistingConnectionsOfDeletion()
    globalServices.workspaceService.send("DELETE_TASK_NODE", {
      nodeId: machine.state.context.customId
    })
  }

  return (
    <div className="border border-white bg-blue-900 p-4 rounded-sm relative cursor-default">
      <div onClick={handleDeleteNode} className="custom-drag-handle absolute top-0 right-6 h-10 w-8 flex items-center justify-center cursor-pointer">
        <TrashIcon className="fill-current w-6" />
      </div>
      <div className="custom-drag-handle absolute top-0 right-0 h-10 w-6 flex items-center justify-center cursor-grab">
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
          {customIdError && <span className="text-error label-text-alt text-xs">Not unique</span>}
        </label>
        <input
          value={tempCustomId}
          onChange={handleCustomIdChange}
          type="text"
          placeholder="Type here"
          className={`${customIdError ? "input-error" : ""} input input-bordered w-full max-w-xs`}
        />
      </div>
      {children}
    </div>
  );
};
