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
  Connection
} from "reactflow";
import 'reactflow/dist/style.css';
import dynamic, { DynamicOptions, Loader } from "next/dynamic";
const Background = dynamic<BackgroundProps>(
  import("reactflow").then((mod) => mod.Background) as
  | DynamicOptions<{}>
  | Loader<{}>,
  { ssr: false }
); // disable ssr
import {
  AiPromptNode,
  TaskNode,
  HttpTaskNode,
  BridgeTaskNode,
  JsonParseTaskNode,
  CborParseTaskNode,
  EthCallTaskNode,
  EthTxTaskNode,
  DivideTaskNode,
  MultiplyTaskNode,
  MeanTaskNode,
  SumTaskNode,
  EthAbiEncodeTaskNode,
  EthAbiDecodeTaskNode,
  EthAbiDecodeLogTaskNode,
  LessThanTaskNode,
  LengthTaskNode,
  LookupTaskNode
} from "./nodes";
import clsx from "clsx";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TASK_TYPE } from "../workspace/taskNodeMachine";
import { XYCoords } from "../workspace/node";
import { CustomConnectionLine } from "./CustomConnectionLine";
import { CustomEdge } from "./CustomEdge";
import { NEW_NODE_TYPE } from "../workspace/workspaceMachine";

const taskNodesSelector = (state: any) => state.context.nodes.tasks;
const aiNodesSelector = (state: any) => state.context.nodes.ai;
const edgesSelector = (state: any) => state.context.edges;
const reactFlowInstanceSelector = (state: any) => state.context.reactFlowInstance;
const testModeSelector = (state: any) => state.matches("testModeLoading") || state.matches("testMode")
const defaultModeSelector = (state: any) => state.matches("idle.defaultMode")
const aiWandModeSelector = (state: any) => state.matches("idle.aiWandMode")

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

  const aiNodesFromMachine = useSelector(
    globalServices.workspaceService,
    aiNodesSelector
  );

  const edgesFromMachine = useSelector(
    globalServices.workspaceService,
    edgesSelector
  );

  const reactFlowInstance = useSelector(
    globalServices.workspaceService,
    reactFlowInstanceSelector
  )

  const testMode = useSelector(
    globalServices.workspaceService,
    testModeSelector
  )

  const isDefaultMode = useSelector(
    globalServices.workspaceService,
    defaultModeSelector
  )

  const isAiWandMode = useSelector(
    globalServices.workspaceService,
    aiWandModeSelector
  )

  const taskNodeToFlowElement = (node: any, index: number, numNodes: number) => {
    const nodeType = node.ref.machine.id;

    const { coords, taskType } = node.ref.state.context;

    let flowElement = {
      id: node.ref.id,
      type: "",
      data: {
        type: taskType,
        machine: node.ref,
        deletable: numNodes > 1,
        numNodes: numNodes
      },
      position: coords,
      dragHandle: ".custom-drag-handle",
    };

    switch (taskType) {
      case "HTTP":
        flowElement.type = "httpTask";
        break;
      case "BRIDGE":
        flowElement.type = "bridgeTask";
        break;
      case "JSONPARSE":
        flowElement.type = "jsonParseTask";
        break;
      case "CBORPARSE":
        flowElement.type = "cborParseTask";
        break;
      case "ETHTX":
        flowElement.type = "ethTxTask";
        break;
      case "ETHCALL":
        flowElement.type = "ethCallTask";
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
      case "SUM":
        flowElement.type = "sumTask";
        break;
      case "ETHABIDECODELOG":
        flowElement.type = "ethAbiDecodeLogTask";
        break;
      case "ETHABIDECODE":
        flowElement.type = "ethAbiDecodeTask";
        break;
      case "ETHABIENCODE":
        flowElement.type = "ethAbiEncodeTask";
        break;
      case "LESSTHAN":
        flowElement.type = "lessThanTask";
        break;
      case "LENGTH":
        flowElement.type = "lengthTask";
        break;
      case "LOOKUP":
        flowElement.type = "lookupTask";
        break;
      default:
        flowElement.type = "task";
        break;
    }

    return flowElement;
  };

  const aiNodeToFlowElement = (node: any, index: number, numNodes: number) => {
    const nodeType = node.ref.machine.id;

    const { coords } = node.ref.state.context;

    let flowElement = {
      id: node.ref.id,
      type: nodeType,
      data: {
        machine: node.ref,
        numNodes: numNodes
      },
      position: coords,
      dragHandle: ".custom-drag-handle",
    };

    return flowElement
  }

  const elements = [
    ...taskNodesFromMachine.map((node: any, index: number) => taskNodeToFlowElement(node, index, taskNodesFromMachine.length)),
    ...aiNodesFromMachine.map((node: any, index: number) => aiNodeToFlowElement(node, index, aiNodesFromMachine.length))
  ];

  const [prevElements, setPrevElements] = useState<Array<{
    id: string;
    type: string;
  }>>([])

  useEffect(() => {
    const elementsToCompare = elements.map((element) => ({ id: element.id, type: element.type }));
    if ((JSON.stringify(elementsToCompare.sort()) !== JSON.stringify(prevElements.sort()))) {
      setPrevElements(elementsToCompare);

      // Sync up flow nodes with our machine state
      setNodes((nds) => elements);
    }
  }, [elements]);

  const [nodes, setNodes, onNodesChange] = useNodesState(elements);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setEdges(edgesFromMachine.map((edge: any) => ({ type: "custom", ...edge })));
  }, [edgesFromMachine]);

  useEffect(() => {
    handleAddNewNode({ x: 150, y: 150 }, "HTTP");
  }, []);

  const handleAddNewNode = (
    initialCoords: XYCoords,
    taskType: TASK_TYPE,
    newNodeType?: NEW_NODE_TYPE,
    fromHandleId?: string
  ) => {
    globalServices.workspaceService.send("ADD_TASK_NODE", {
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

    if (testMode) return

    globalServices.workspaceService.send("CONNECTION_START", { params });
  };

  const handleConnectEnd: OnConnectEnd = (event) => {

    if (testMode) return

    globalServices.workspaceService.send("CONNECTION_END")

    // @ts-ignore
    const toExistingNodeId = event?.target?.dataset?.nodeid

    // If the connection was dragged to an existing node's handle we let the onConnect handler deal with it
    if (toExistingNodeId) return;

    const viewport = reactFlowInstance?.getViewport() || {
      x: 0,
      y: 0,
      zoom: 1,
    };

    const { clientX, clientY } = "touches" in event ? event.touches[0] : event

    const snappedCoords = snapToGrid({
      x: (clientX - viewport.x) / viewport.zoom - NODE_WIDTH / 2,
      y: (clientY - viewport.y) / viewport.zoom,
    });

    globalServices.workspaceService.send("CONNECTION_SUCCESS", {
      initialCoords: { x: snappedCoords.snappedX, y: snappedCoords.snappedY },
    });
  };

  const getTaskNodeById = (nodeId: string) =>
    taskNodesFromMachine.find((taskNode: any) => taskNode.ref.id === nodeId);

  const handleConnect = (newConnection: Connection) => {

    if (testMode) return

    const sourceTaskNode = getTaskNodeById(newConnection.source || "");

    const targetTaskNode = getTaskNodeById(newConnection.target || "");

    const sourceTaskCustomId = sourceTaskNode.ref.state.context.customId
    const targetTaskCustomId = targetTaskNode.ref.state.context.customId

    if (sourceTaskNode && targetTaskNode) {
      sourceTaskNode.ref.send("ADD_OUTGOING_NODE", {
        nodeId: targetTaskCustomId,
      });

      targetTaskNode.ref.send("ADD_INCOMING_NODE", {
        nodeId: sourceTaskCustomId,
      });
    }

    globalServices.workspaceService.send("ADD_NEW_EDGE", {
      newEdge: {
        source: newConnection.source,
        target: newConnection.target,
        sourceCustomId: sourceTaskCustomId,
        targetCustomId: targetTaskCustomId
      }
    })
  };

  const handleReactFlowInit = (reactFlowInstance: ReactFlowInstance) => {
    globalServices.workspaceService.send("SET_REACT_FLOW_INSTANCE", { value: reactFlowInstance })
  }

  const handleNodeDragStop = (event: React.MouseEvent, node: ReactFlowNode) => {
    const taskNodeMachine = taskNodesFromMachine.filter((taskNode: any) => taskNode.ref.id === node.id)[0]?.ref

    taskNodeMachine && taskNodeMachine.send("UPDATE_COORDS", { value: node.position })
  }

  const nodeTypes = useMemo(
    () => ({
      aiPrompt: AiPromptNode,
      task: TaskNode,
      httpTask: HttpTaskNode,
      bridgeTask: BridgeTaskNode,
      jsonParseTask: JsonParseTaskNode,
      cborParseTask: CborParseTaskNode,
      ethTxTask: EthTxTaskNode,
      ethCallTask: EthCallTaskNode,
      divideTask: DivideTaskNode,
      multiplyTask: MultiplyTaskNode,
      meanTask: MeanTaskNode,
      sumTask: SumTaskNode,
      ethAbiDecodeLogTask: EthAbiDecodeLogTaskNode,
      ethAbiDecodeTask: EthAbiDecodeTaskNode,
      ethAbiEncodeTask: EthAbiEncodeTaskNode,
      lessThanTask: LessThanTaskNode,
      lengthTask: LengthTaskNode,
      lookupTask: LookupTaskNode
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
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
          edgeTypes={edgeTypes}
          snapToGrid={true}
          snapGrid={[15, 15]}
          onNodeDragStop={handleNodeDragStop}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          connectionLineStyle={{ strokeWidth: 4 }}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          onConnect={handleConnect}
          connectionLineComponent={CustomConnectionLine}
          panOnDrag={isDefaultMode || testMode}
          selectionOnDrag={isAiWandMode}
          fitView
          fitViewOptions={{
            duration: 500,
            padding: 1
          }}
          nodesDraggable={!testMode}
          minZoom={0.35}
        >
          <Controls position="bottom-right" />
          <Background gap={15} color="#666666" />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};
