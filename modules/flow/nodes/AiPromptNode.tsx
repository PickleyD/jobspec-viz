import { Handle, NodeProps, Position } from "reactflow";
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { TrashIcon } from "@heroicons/react/24/solid";
import { TextArea } from "./fields";
import { Button } from "@/components/ui/button";

const nodesSelector = (state: any) => state.context.nodes;

const customIdSelector = (state: any) => state.context.customId;
const outgoingNodesSelector = (state: any) => state.context.outgoingNodes;
const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const tomlSelector = (state: any) => state.context.toml;
const isConnectingSelector = (state: any) => state.context.isConnecting
const testModeSelector = (state: any) => state.matches("testModeLoading") || state.matches("testMode")

const promptSelector = (state: any) => state.context.prompt;

const isIdleSelector = (state: any) => {
  return state.matches('idle');
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

type AiPromptNodeProps = NodeProps & {
  useDefaultHandles?: boolean;
  children?: React.ReactNode;
};

export const AiPromptNode = ({
  id,
  data,
  useDefaultHandles = true,
  children
}: AiPromptNodeProps) => {
  const { machine, deletable, numNodes } = data;

  const isIdle = useSelector(machine, isIdleSelector)
  const isRunning = useSelector(machine, isRunningSelector)
  const isSuccess = useSelector(machine, isSuccessSelector)
  const isError = useSelector(machine, isErrorSelector)

  const outgoingNodeIds = useSelector(machine, outgoingNodesSelector);
  const incomingNodeIds = useSelector(machine, incomingNodesSelector);

  const prompt = useSelector(machine, promptSelector)

  const globalServices = useContext(GlobalStateContext);
  const nodesFromMachine = useSelector(
    globalServices.workspaceService,
    nodesSelector
  );

  const toml = useSelector(
    globalServices.workspaceService,
    tomlSelector
  )

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

  const getNodeById = (nodeId: string) =>
    nodesFromMachine.ai.find((node: any) => node.ref.id === nodeId);

  const handleDeleteNode = () => {
    globalServices.workspaceService.send("DELETE_NODE", {
      nodeId: machine.id,
    });
  };

  const handleSubmit = () => {
    machine.send("PROCESS_PROMPT", { toml })
  }

  return (
    <div className="relative overflow-visible isolate">
      {/* width divisible by grid snap size */}
      <div className="bg-background flex flex-col justify-center items-center p-1 rounded-lg relative cursor-default shadow-lg ring ring-accent/60 w-[300px]">
        {isIdle && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
          <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-secondary-light via-secondary via-secondary-dark via-secondary to-secondary-light"></div>
        </div>
        }
        {isRunning && <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden flex flex-col justify-center items-center rounded-lg z-0">
          <div className="animate-spin absolute w-[2000px] h-[2000px] bg-gradient-conic from-background to-secondary"></div>
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
          <div
            onClick={handleDeleteNode}
            className="z-30 absolute top-2 right-8 h-10 w-8 flex items-center justify-center cursor-pointer"
          >
            <TrashIcon className="fill-current w-6" />
          </div>
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
          <div className="flex flex-col gap-2 relative">
            <p className="text-xl font-bold">AI Wizard</p>
            <TextArea
              textAreaClassName="h-60"
              placeholder={
                `What would you like this task to do?\n\ne.g. now parse the payload and extract the 'price' value. The format from the previous task response is { data: [{ price: 125.43 }]}
              `}
              value={prompt}
              onChange={(newValue) => machine.send("SET_PROMPT", { value: newValue })}
            />
            <Button
              onClick={handleSubmit}
            >
              Generate
            </Button>
          </div>
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
      </div>
    </div>
  );
};
