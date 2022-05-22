import ReactFlow, {
  Controls,
  BackgroundProps,
  ReactFlowProvider,
  ReactFlowInstance,
  useNodesState,
  useEdgesState,
  addEdge,
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
const taskNodesSelector = (state: any) => state.context.nodes.tasks;

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

  const taskNodesFromMachine = useSelector(
    globalServices.workspaceService,
    taskNodesSelector
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

  const elements = [...taskNodesFromMachine.map(nodeToFlowElement)];

  const [prevElementsLength, setPrevElementsLength] = useState(0);
  useEffect(() => {
    if (elements.length !== prevElementsLength) {
      setPrevElementsLength(elements.length);

      const elementIds = elements.map(element => element.id)

      // Sync up flow nodes with our machine state
      setNodes((nds) => nds
        .filter(node => elementIds.includes(node.id))
        .concat(elements.filter(element => !nds.map(node => node.id).includes(element.id)))
      );

      // Remove any edges which don't link between two active nodes
      setEdges(edges => edges.filter(edge => elementIds.includes(edge.source) && elementIds.includes(edge.target)))
    }
  }, [elements]);

  const [nodes, setNodes, onNodesChange] = useNodesState(elements);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const getTaskNodeById = (nodeId: string) =>
    taskNodesFromMachine.find((taskNode: any) => taskNode.ref.id === nodeId);

  const handleNewConnection = (newConnection: Connection) => {

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

    onConnect(newConnection);
  };

  const [prevEdgesLength, setPrevEdgesLength] = useState(0);
  useEffect(() => {
    if (edges.length > 0) {
      // setPrevEdgesLength(edges.length);

      const withCustomIds = [
        ...edges.map(edge => ({
          ...edge,
          sourceCustomId: getTaskNodeById(edge.source).ref.state.context.customId,
          targetCustomId: getTaskNodeById(edge.target).ref.state.context.customId
        }))
      ]

      globalServices.workspaceService.send("SET_EDGES", {
        newEdges: withCustomIds,
      });
    }
  }, [edges]);

  const onConnect = useCallback(
    (connection: any) => {
      return setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
    },
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
