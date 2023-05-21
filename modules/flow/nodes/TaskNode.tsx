import { Handle, NodeProps, Position } from "reactflow";
import React, { useContext, useEffect, useId, useState } from "react";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Squares2X2Icon, XMarkIcon, PlayIcon } from "@heroicons/react/24/outline";
import { TASK_TYPE } from "../../workspace/taskNodeMachine";
import { XYCoords } from "../../workspace/node";
import { TaskSelector } from "../taskSelector/TaskSelector";
import { FieldLabel } from "../../../components";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const nodesSelector = (state: any) => state.context.nodes;

const customIdSelector = (state: any) => state.context.customId;
const outgoingNodesSelector = (state: any) => state.context.outgoingNodes;
const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const isConnectingSelector = (state: any) => state.context.isConnecting
const testModeSelector = (state: any) => state.matches("testModeLoading") || state.matches("testMode")

const isIdleSelector = (state: any) => {
  return state.matches('idle');
};
const isPendingRunSelector = (state: any) => {
  return state.matches('pendingRun');
};
const isRunningSelector = (state: any) => {
  return state.matches('running');
};
const isSuccessSelector = (state: any) => {
  return state.matches('success');
};
const isErrorSelector = (state: any) => {
  return state.matches('error');
};
const isPendingSideEffectSelector = (state: any) => {
  return state.matches('pendingSideEffect');
};
const isRunningSideEffectSelector = (state: any) => {
  return state.matches('executingSideEffect');
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
  const { machine, deletable, numNodes } = data;

  const isIdle = useSelector(machine, isIdleSelector)
  const isRunning = useSelector(machine, isRunningSelector)
  const isPendingRun = useSelector(machine, isPendingRunSelector)
  const isSuccess = useSelector(machine, isSuccessSelector)
  const isError = useSelector(machine, isErrorSelector)
  const isPendingSideEffect = useSelector(machine, isPendingSideEffectSelector)
  const isRunningSideEffect = useSelector(machine, isRunningSideEffectSelector)

  const [prevCustomId, setPrevCustomId] = useState<string>();
  const customId = useSelector(machine, customIdSelector);
  const outgoingNodeIds = useSelector(machine, outgoingNodesSelector);
  const incomingNodeIds = useSelector(machine, incomingNodesSelector);

  const globalServices = useContext(GlobalStateContext);
  const nodesFromMachine = useSelector(
    globalServices.workspaceService,
    nodesSelector
  );

  const isConnecting = useSelector(
    globalServices.workspaceService,
    isConnectingSelector
  )

  const testMode = useSelector(
    globalServices.workspaceService,
    testModeSelector
  )

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
      getTaskNodeByCustomId(nodeId)
    );

    outgoingNodes.map((outgoingNode: any) => {
      outgoingNode?.ref?.send("UPDATE_INCOMING_NODE", {
        nodeId: customId,
        prevNodeId: prevCustomId,
      });
    });

    const incomingNodes = incomingNodeIds.map((nodeId: string) =>
      getTaskNodeByCustomId(nodeId)
    )

    incomingNodes.map((incomingNode: any) => {
      incomingNode?.ref?.send("UPDATE_OUTGOING_NODE", {
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
      getTaskNodeByCustomId(nodeId)
    );

    outgoingNodes.map((outgoingNode: any) => {
      outgoingNode?.ref && outgoingNode.ref.send("REMOVE_INCOMING_NODE", {
        nodeId: customId,
      });
    });
  };

  const handleDeleteNode = () => {
    notifyExistingConnectionsOfDeletion();
    globalServices.workspaceService.send("DELETE_NODE", {
      nodeId: machine.id,
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
      nodeId: machine.id,
      existing: {
        coords: getNodePosition(),
        customId: machine.state.context.customId,
        incomingNodes: machine.state.context.incomingNodes,
        outgoingNodes: machine.state.context.outgoingNodes
      },
      newType: task,
    })
  }

  const handleTaskRun = () => {
    globalServices.workspaceService.send("TRY_RUN_CURRENT_TASK")
  }

  const [hasDraggedFromHandle, setHasDraggedFromHandle] = useState<boolean>(false)

  useEffect(() => {
    isConnecting && setHasDraggedFromHandle(true)
  }, [isConnecting])

  const taskIdFieldId = useId()

  return (
    <div className="relative overflow-visible isolate">
      {/* width divisible by grid snap size */}
      <div className="bg-popover flex flex-col justify-center items-center p-1 rounded-lg relative cursor-default shadow-lg ring ring-accent/60 w-[300px]">
        {(isPendingRun || isPendingSideEffect) && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
          <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-pending-light via-pending via-pending-dark via-pending to-pending-light"></div>
        </div>
        }
        {(isRunning || isRunningSideEffect) && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
          <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-background to-pending"></div>
        </div>
        }
        {isSuccess && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
          <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-success-light via-success via-success-dark via-success to-success-light"></div>
        </div>
        }
        {isError && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
          <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-error-light via-error via-error-dark via-error to-error-light"></div>
        </div>
        }
        <div className="relative w-full h-full p-3 bg-background rounded-md z-10">
          <div className="inset-0 absolute bg-gradient-radial-top dark:from-foreground/[.06] from-foreground/[.15] to-transarent rounded-md" />
          <div className="inset-0 absolute bg-gradient-radial-bottom dark:from-foreground/[.06] from-foreground/[.15] to-transparent rounded-md" />
          <div className="absolute invert dark:invert-0 bg-noise opacity-20 inset-0 rounded-md" />
          {deletable &&
            <div
              onClick={handleDeleteNode}
              className="z-30 absolute top-2 right-8 h-10 w-8 flex items-center justify-center cursor-pointer"
            >
              <TrashIcon className="fill-current w-6" />
            </div>
          }
          {testMode &&
            <div className="absolute inset-0 transparent z-20">
              <div className="absolute inset-0 bg-background opacity-20 rounded-lg" />

              {/* {
                isPendingRun && <div className="relative w-full h-full p-6 flex items-end justify-center">
                  <button
                    onClick={handleTaskRun}
                    className="border-2 border-secondary hover:border-white focus:border-white rounded-full bg-secondary p-2 flex flex-row items-center justify-center text-muted-foreground hover:text-black"
                  >
                    <span className="px-2">Run Task</span>
                    <PlayIcon className="fill-current w-6 h-6" />
                  </button>
                </div>
              } */}
            </div>
          }
          <div className="custom-drag-handle absolute top-2 right-2 h-10 w-6 flex items-center justify-center cursor-grab z-30">
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
                className="!w-6 !h-6 !bg-foreground !border-background !border-2 !-top-3 z-30"
              />
              <Handle
                id={`${id}-bottom`}
                type="source"
                position={Position.Bottom}
                className="!w-6 !h-6 !bg-foreground !border-background !border-2 !-bottom-3 shadow-widget z-30"
              />
            </>
          )}
          <div className="relative">
            <div className="flex flex-row items-center gap-2">
              <p className="text-xl font-bold text-primary">{data.type}</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-6 h-6 rounded-full p-0">
                    <Squares2X2Icon className="h-4 w-4" />
                    <span className="sr-only">Open task selector</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <TaskSelector onTaskSelected={handleTaskSelected} value={data.type} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col w-full max-w-xs">
              <div className="flex items-end justify-between">
                <FieldLabel name="Task ID" htmlFor={taskIdFieldId} />
                {customIdError && (
                  <span className="text-error label-text-alt text-xs mb-[2px]">
                    Not unique
                  </span>
                )}
              </div>
              <Input
                id={taskIdFieldId}
                value={tempCustomId}
                onChange={handleCustomIdChange}
                type="text"
                placeholder="Give the task a unique ID"
                className={`w-full max-w-xs`}
              />
            </div>
            {children}
          </div>
        </div>
      </div>
      {numNodes === 1 && !hasDraggedFromHandle &&
        <div className="absolute -bottom-[92px] left-[160px]">
          <div className="relative">
            <svg className="absolute -top-[44px] -left-[24px] fill-current w-16 -scale-x-100 rotate-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 359.171 359.171" xmlSpace="preserve"><path d="M351.689 201.729c-.612-46.512-6.732-95.472-18.972-140.76-3.061-9.792-17.748-6.12-15.301 4.284 9.792 40.392 15.912 81.396 17.748 123.013 1.837 41.615 2.448 97.308-27.54 129.743-15.3 16.524-42.84 15.912-63.647 17.137-30.601 1.836-61.812 1.224-92.412-.612-30.6-1.224-61.812-4.284-92.412-7.956-16.524-1.836-43.452-11.016-58.14-3.06-1.224.611-1.224 2.447-.612 3.06 11.016 14.076 42.228 13.464 58.752 15.912 36.72 4.896 72.828 7.344 109.548 9.18 44.675 1.836 114.443 11.017 149.939-22.644 32.437-29.377 33.049-86.905 33.049-127.297z" /><path d="M338.225 8.949c-4.284-6.12-11.628-4.896-14.688 1.836-8.567 20.808-22.031 39.78-30.6 60.588-2.448 6.12 6.732 9.18 9.792 4.284 9.792-15.912 18.972-31.824 28.764-47.736l7.345 14.688c3.06 7.956 3.672 15.912 7.344 23.256 2.447 5.508 9.792 3.06 11.628-1.224 6.119-17.136-9.793-41.616-19.585-55.692z" /></svg>
            <div className="rotate-12 text-center text-xs font-hand">Drag from the handles to add another task</div>
          </div>
        </div>
      }
    </div>
  );
};
