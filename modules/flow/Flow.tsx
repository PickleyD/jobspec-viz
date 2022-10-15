import ReactFlow, {
  Controls,
  BackgroundProps,
  ReactFlowProvider,
  ReactFlowInstance,
  useNodesState,
  useEdgesState,
  OnConnectEnd,
  OnConnectStart,
  Node as ReactFlowNode,
  EdgeChange
} from "react-flow-renderer";
import dynamic, { DynamicOptions, Loader } from "next/dynamic";
const Background = dynamic<BackgroundProps>(
  import("react-flow-renderer").then((mod) => mod.Background) as
    | DynamicOptions<{}>
    | Loader<{}>,
  { ssr: false }
); // disable ssr
import {
  TaskNode,
  HttpTaskNode,
  JsonParseTaskNode,
  EthTxTaskNode,
  DivideTaskNode,
  MultiplyTaskNode,
  MeanTaskNode,
} from "./nodes";
import clsx from "clsx";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { XYCoords, TASK_TYPE } from "../workspace/taskNodeMachine";
import { CustomConnectionLine } from "./CustomConnectionLine";
import { NEW_NODE_TYPE } from "../workspace/workspaceMachine";

const taskNodesSelector = (state: any) => state.context.nodes.tasks;
const edgesSelector = (state: any) => state.context.edges;
const reactFlowInstanceSelector = (state: any) => state.context.reactFlowInstance;

export const NODE_WIDTH = 300;
export const SNAP_GRID = 15;

const toNearestGridMark = (n: number) => Math.round(n / SNAP_GRID) * SNAP_GRID;

// Rounds coordinates to closest grid snap
export const snapToGrid = ({ x, y }: { x: number; y: number }) => {
  return {
    snappedX: toNearestGridMark(x),
    snappedY: toNearestGridMark(y),
  };
};

export interface FlowProps {
  className?: string;
}

export const Flow = ({ className }: FlowProps) => {
  const topLevelStyles = clsx(className, "h-full w-full");

  const globalServices = useContext(GlobalStateContext);

  const taskNodesFromMachine = useSelector(
    globalServices.workspaceService,
    taskNodesSelector
  );

  const edgesFromMachine = useSelector(
    globalServices.workspaceService,
    edgesSelector
  );

  const reactFlowInstance = useSelector(
    globalServices.workspaceService,
    reactFlowInstanceSelector
  )

  const nodeToFlowElement = (node: any) => {
    const nodeType = node.ref.machine.id;

    const { coords, taskType } = node.ref.state.context;

    let flowElement = {
      id: node.ref.id,
      type: "",
      data: {
        type: taskType,
        machine: node.ref,
      },
      position: coords,
      dragHandle: ".custom-drag-handle",
    };

    switch (taskType) {
      case "HTTP":
        flowElement.type = "httpTask";
        break;
      case "JSONPARSE":
        flowElement.type = "jsonParseTask";
        break;
      case "ETHTX":
        flowElement.type = "ethTxTask";
        break;
      case "DIVIDE":
        flowElement.type = "divideTask";
        break;
      case "MULTIPLY":
        flowElement.type = "multiplyTask";
        break;
      case "MEAN":
        flowElement.type = "meanTask";
        break;
      default:
        flowElement.type = "task";
        break;
    }

    return flowElement;
  };

  const elements = [...taskNodesFromMachine.map(nodeToFlowElement)];

  const [prevElements, setPrevElements] = useState<Array<{
    id: string;
    type: string;
  }>>([])

  useEffect(() => {
    const elementsToCompare = elements.map((element) => ({id: element.id, type: element.type}));
    if ((JSON.stringify(elementsToCompare.sort()) !== JSON.stringify(prevElements.sort()))) {
      setPrevElements(elementsToCompare);

      // const elementIds = elements.map((element) => element.id);

      // Sync up flow nodes with our machine state
      setNodes((nds) =>
        elements
        // nds
        //   .filter((node) => elementIds.includes(node.id))
        //   .concat(
        //     elements.filter(
        //       (element) => !nds.map((node) => node.id).includes(element.id)
        //     )
        //   )
      );
    }
  }, [elements]);

  const [nodes, setNodes, onNodesChange] = useNodesState(elements);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setEdges(edgesFromMachine);
  }, [edgesFromMachine]);

  useEffect(() => {
    handleAddNewNode({ x: 495, y: 495 }, "HTTP");
  }, []);

  const handleAddNewNode = (
    initialCoords: XYCoords,
    taskType: TASK_TYPE,
    newNodeType?: NEW_NODE_TYPE,
    fromHandleId?: string
  ) => {
    globalServices.workspaceService.send("NEW_TASK_NODE.ADD", {
      options: {
        initialCoords,
        taskType,
      },
      edgeDetails: {
        newNodeType,
        fromHandleId,
      },
    });
  };

  const handleConnectStart: OnConnectStart = (event, params) => {
    globalServices.workspaceService.send("CONNECTION_START", { params });
  };

  const handleConnectEnd: OnConnectEnd = (event) => {
    const viewport = reactFlowInstance?.getViewport() || {
      x: 0,
      y: 0,
      zoom: 1,
    };

    const snappedCoords = snapToGrid({
      x: (event.clientX - viewport.x) / viewport.zoom - NODE_WIDTH / 2,
      y: (event.clientY - viewport.y) / viewport.zoom,
    });

    globalServices.workspaceService.send("CONNECTION_END", {
      initialCoords: { x: snappedCoords.snappedX, y: snappedCoords.snappedY },
    });
  };

  const handleReactFlowInit = (reactFlowInstance: ReactFlowInstance) => {
    globalServices.workspaceService.send("SET_REACT_FLOW_INSTANCE", { value: reactFlowInstance})
  }

  const handleNodeDragStop = (event: React.MouseEvent, node: ReactFlowNode) => {
    const taskNodeMachine = taskNodesFromMachine.filter((taskNode: any) => taskNode.ref.id === node.id)[0]?.ref

    taskNodeMachine && taskNodeMachine.send("UPDATE_COORDS", { value: node.position })
  }

  const nodeTypes = useMemo(
    () => ({
      task: TaskNode,
      httpTask: HttpTaskNode,
      jsonParseTask: JsonParseTaskNode,
      ethTxTask: EthTxTaskNode,
      divideTask: DivideTaskNode,
      multiplyTask: MultiplyTaskNode,
      meanTask: MeanTaskNode,
    }),
    []
  );

  return (
    <ReactFlowProvider>
      <div className={topLevelStyles}>
        <ReactFlow
          onInit={handleReactFlowInit}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[15, 15]}
          onNodeDragStop={handleNodeDragStop}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          connectionLineStyle={{ strokeWidth: 4 }}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          connectionLineComponent={CustomConnectionLine}
        >
          <Controls />
          <Background gap={15} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};
