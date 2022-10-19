import { Handle, NodeProps, Position } from "react-flow-renderer";
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Squares2X2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { TASK_TYPE, XYCoords } from "../../workspace/taskNodeMachine";
import { TaskSelector } from "../taskSelector/TaskSelector";
import { Popover, Transition } from "@headlessui/react"

const nodesSelector = (state: any) => state.context.nodes;

const customIdSelector = (state: any) => state.context.customId;
const outgoingNodesSelector = (state: any) => state.context.outgoingNodes;
const isPendingExecutionSelector = (state: any) => {
  return state.matches('pendingExec');
};
const isProcessingSelector = (state: any) => {
  return state.matches('processing');
};

type TaskNodeProps = NodeProps & {
  useDefaultHandles?: boolean;
  children?: React.ReactNode;
};

export const TaskNode = ({
  id,
  data,
  useDefaultHandles = true,
  children,
  type
}: TaskNodeProps) => {
  const { machine, deletable } = data;

  const isProcessing = useSelector(machine, isProcessingSelector)
  const isPendingExecution = useSelector(machine, isPendingExecutionSelector)

  const [prevCustomId, setPrevCustomId] = useState<string>();
  const customId = useSelector(machine, customIdSelector);
  const outgoingNodeIds = useSelector(machine, outgoingNodesSelector);

  const globalServices = useContext(GlobalStateContext);
  const nodesFromMachine = useSelector(
    globalServices.workspaceService,
    nodesSelector
  );

  const reactFlowInstanceSelector = (state: any) =>
    state.context.reactFlowInstance;

  const isUniqueTaskId = (taskId: string) => {
    return getTaskNodeByCustomId(taskId) === undefined;
  };

  const [tempCustomId, setTempCustomId] = useState<string>(customId);
  const [customIdError, setCustomIdError] = useState<boolean>(false);

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setTempCustomId(newValue);

    // only update in the machine if it's a unique task ID
    if (isUniqueTaskId(newValue)) {
      setCustomIdError(false);

      // cache prev custom ID so we know which to update on outgoing nodes
      setPrevCustomId(customId);

      machine.send("SET_CUSTOM_ID", { value: newValue });
    } else {
      setCustomIdError(true);
    }
  };

  const getTaskNodeById = (nodeId: string) =>
    nodesFromMachine.tasks.find((taskNode: any) => taskNode.ref.id === nodeId);

  const getTaskNodeByCustomId = (nodeId: string) =>
    nodesFromMachine.tasks.find(
      (taskNode: any) => taskNode.ref.state.context.customId === nodeId
    );

  const updateExistingConnections = () => {
    const outgoingNodes = outgoingNodeIds.map((nodeId: string) =>
      getTaskNodeById(nodeId)
    );

    outgoingNodes.map((outgoingNode: any) => {
      outgoingNode.ref.send("UPDATE_INCOMING_NODE", {
        nodeId: customId,
        prevNodeId: prevCustomId,
      });
    });
  };

  const updateStoredEdges = () => {
    globalServices.workspaceService.send("UPDATE_EDGES_WITH_NODE_ID", {
      nodeId: customId,
      prevNodeId: prevCustomId,
    });
  };

  useEffect(() => {
    updateExistingConnections();
    updateStoredEdges();
  }, [customId]);

  const notifyExistingConnectionsOfDeletion = () => {
    const outgoingNodes = outgoingNodeIds.map((nodeId: string) =>
      getTaskNodeById(nodeId)
    );

    outgoingNodes.map((outgoingNode: any) => {
      outgoingNode.ref.send("REMOVE_INCOMING_NODE", {
        nodeId: customId,
      });
    });
  };

  const handleDeleteNode = () => {
    notifyExistingConnectionsOfDeletion();
    globalServices.workspaceService.send("DELETE_TASK_NODE", {
      nodeId: machine.state.context.customId,
    });
  };

  const reactFlowInstance = useSelector(
    globalServices.workspaceService,
    reactFlowInstanceSelector
  );

  const getNodePosition = (): XYCoords => {
    return reactFlowInstance
      ? reactFlowInstance.getNode(machine.id)?.position
      : { x: 0, y: 0 };
  };

  const handleTaskSelected = (task: TASK_TYPE) => {
    globalServices.workspaceService.send("REPLACE_TASK_NODE", {
      nodeId: machine.state.context.customId,
      existing: {
        coords: getNodePosition(),
        customId: machine.state.context.customId,
        incomingNodes: machine.state.context.incomingNodes,
        outgoingNodes: machine.state.context.outgoingNodes
      },
      newType: task,
    })
  }

  return (
    // width divisible by grid snap size
    <div className="bg-base-100 flex flex-col justify-center items-center p-1 rounded-lg relative cursor-default shadow-widget text-white w-[300px]">
      {isPendingExecution && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
        <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-base-100 to-secondary"></div>
      </div>
      }
      {isProcessing && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
        <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-base-100 to-secondary"></div>
      </div>
      }
      <div className="relative w-full h-full p-3 bg-base-100 rounded-md z-10">
        {deletable &&
          <div
            onClick={handleDeleteNode}
            className="custom-drag-handle absolute top-2 right-8 h-10 w-8 flex items-center justify-center cursor-pointer"
          >
            <TrashIcon className="fill-current w-6" />
          </div>
        }
        <div className="custom-drag-handle absolute top-2 right-2 h-10 w-6 flex items-center justify-center cursor-grab">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current"
            height="28"
            viewBox="0 0 24 24"
            width="28"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
        {useDefaultHandles && (
          <>
            <Handle
              id={`${id}-top`}
              type="target"
              position={Position.Top}
              className="!w-6 !h-6 !bg-white !border-black !border-2 !-top-3"
            />
            <Handle
              id={`${id}-bottom`}
              type="source"
              position={Position.Bottom}
              className="!w-6 !h-6 !bg-white !border-black !border-2 !-bottom-3 shadow-widget"
            />
          </>
        )}
        <div className="flex flex-row items-center gap-2">
          <p className="text-xl font-bold">{data.type}</p>
          <div className="relative flex flex-col items-center">
            <Popover>
              {({ open }) => (
                <div className="relative flex flex-col items-center">
                  <Popover.Button className="focus:outline-none">
                    <label
                      tabIndex={0}
                      className={`border-gray-800 focus:border fous:border-secondary hover:border hover:border-secondary focus:border-secondary bg-base-100 h-6 w-6 min-h-0 btn btn-circle swap swap-rotate ${open ? "swap-active" : ""}`}
                    >
                      <Squares2X2Icon className="swap-off h-4 w-4 text-white" />
                      <XMarkIcon className="swap-on h-4 w-4 text-white" />
                    </label>
                  </Popover.Button>
                  <Transition
                    className="z-10 w-fit absolute top-5 z-10"
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Popover.Panel className="flex flex-col items-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" className="fill-gray-700">
                        <polygon points="0,10 5,5 10,10" />
                      </svg>
                      <div className={`bg-base-300 rounded-lg border border-gray-700`}>
                        <TaskSelector onTaskSelected={handleTaskSelected} value={data.type} />
                      </div>
                    </Popover.Panel>
                  </Transition>
                </div>
              )}

            </Popover>
          </div>
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Task ID</span>
            {customIdError && (
              <span className="text-error label-text-alt text-xs">
                Not unique
              </span>
            )}
          </label>
          <input
            value={tempCustomId}
            onChange={handleCustomIdChange}
            type="text"
            placeholder="Type here"
            className={`${customIdError ? "input-error" : ""
              } input input-bordered w-full max-w-xs`}
          />
        </div>
        {children}
      </div>
    </div>
  );
};
