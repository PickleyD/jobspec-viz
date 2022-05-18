import ReactFlow, {
  Controls,
  BackgroundProps,
  ReactFlowProvider,
  ReactFlowInstance,
  useNodesState,
  useEdgesState,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  getOutgoers,
  Connection,
} from "react-flow-renderer";
import dynamic, { DynamicOptions, Loader } from "next/dynamic";
const Background = dynamic<BackgroundProps>(
  import("react-flow-renderer").then((mod) => mod.Background) as
  | DynamicOptions<{}>
  | Loader<{}>,
  { ssr: false }
); // disable ssr
import { TaskNode, HttpTaskNode } from "./nodes";
import clsx from "clsx";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import { XYCoords, TASK_TYPE } from "../workspace/taskNodeMachine";
import { DivideTaskNode } from "./nodes/DivideTaskNode";

const nodesSelector = (state: any) => state.context.nodes;

export interface FlowProps {
  className?: string;
}

export const Flow = ({ className }: FlowProps) => {
  const topLevelStyles = clsx(className, "h-full w-full");

  const globalServices = useContext(GlobalStateContext);
  const nodesFromMachine = useSelector(
    globalServices.workspaceService,
    nodesSelector
  );

  const nodeToFlowElement = (node: any) => {
    const nodeType = node.ref.machine.id;

    const { initialCoords, taskType } = node.ref.state.context;

    let flowElement = {
      id: node.ref.id,
      type: "",
      data: {
        label: <>{taskType}</>,
        machine: node.ref,
      },
      position: initialCoords,
      dragHandle: '.custom-drag-handle'
    };

    switch (taskType) {
      case "HTTP":
        flowElement.type = "httpTask";
        break;
      case "DIVIDE":
        flowElement.type = "divideTask";
        break;
      default:
        flowElement.type = "task";
        break;
    }

    return flowElement;
  };

  const elements = [...nodesFromMachine.tasks.map(nodeToFlowElement)];

  const [prevElementsLength, setPrevElementsLength] = useState(0);
  useEffect(() => {
    if (elements.length > 0 && elements.length !== prevElementsLength) {
      setPrevElementsLength(elements.length);
      setNodes((nds) => nds.concat(elements[elements.length - 1]));
    }
  }, [elements]);

  const [nodes, setNodes, onNodesChange] = useNodesState(elements);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const getTaskNodeById = (nodeId: string) =>
    nodesFromMachine.tasks.find((taskNode: any) => taskNode.ref.id === nodeId);

  const handleNewConnection = (newConnection: Connection) => {

    const sourceTaskNode = getTaskNodeById(newConnection.source || "");

    const targetTaskNode = getTaskNodeById(newConnection.target || "");

    if (sourceTaskNode && targetTaskNode) {
      sourceTaskNode.ref.send("ADD_OUTGOING_NODE", {
        nodeId: targetTaskNode.ref.state.context.customId,
      });

      targetTaskNode.ref.send("ADD_INCOMING_NODE", {
        nodeId: sourceTaskNode.ref.state.context.customId,
      });
    }

    onConnect(newConnection);
  };

  const [prevEdgesLength, setPrevEdgesLength] = useState(0);
  useEffect(() => {
    if (edges.length > 0 && edges.length !== prevEdgesLength) {
      setPrevEdgesLength(edges.length);

      globalServices.workspaceService.send("SET_EDGES", {
        newEdges: edges,
      });
    }
  }, [edges]);

  const onConnect = useCallback(
    (connection: any) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  /**
   * Handle drop event. This will mean a new node from
   * the toolbar has been dragged over the flow and dropped.
   * @param item
   * @param monitor
   */
  const handleDrop = (item: any, monitor: any) => {
    const clientOffset = monitor.getClientOffset() as XYCoords;

    const position = reactFlowInstance?.project(clientOffset) || { x: 0, y: 0 };

    handleAddNewNode(position, item.taskType);
  };

  const handleAddNewNode = (initialCoords: XYCoords, taskType: TASK_TYPE) => {
    globalServices.workspaceService.send("NEW_TASK_NODE.ADD", {
      options: {
        initialCoords,
        taskType
      },
    });
  };

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: "node",
      drop: (item, monitor) => handleDrop(item, monitor),
      collect: (monitor) => {
        return {
          isOver: Boolean(monitor.isOver()),
        };
      },
    }),
    [reactFlowInstance]
  );

  const nodeTypes = useMemo(() => ({ task: TaskNode, httpTask: HttpTaskNode, divideTask: DivideTaskNode }), []);

  return (
    <ReactFlowProvider>
      <div className={topLevelStyles} ref={dropRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[15, 15]}
          onInit={setReactFlowInstance}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleNewConnection}
        >
          <Controls />
          <Background gap={15} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};
