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
    console.log("new edge");
    console.log(newConnection);

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
      console.log("store edges:");
      console.log(edges);

      globalServices.workspaceService.send("SET_EDGES", {
        newEdges: edges,
      });

      console.log("getOutgoers");
      console.log(getOutgoers(nodes[0], nodes, edges));
    }
  }, [edges]);

  // const [nodes, setNodes] = useState(elements);
  // const [edges, setEdges] = useState<Edge<any>[]>([]);

  // const onNodesChange = useCallback((changes: any) => {
  //   console.log("onNodesChange");
  //   console.log(changes);
  //   setNodes((ns) => applyNodeChanges(changes, ns));
  // }, []);
  // const onEdgesChange = useCallback((changes: any) => {
  //   console.log("onEdgesChange");
  //   console.log(changes);
  //   return setEdges((es) => applyEdgeChanges(changes, es));
  // }, []);

  const onConnect = useCallback(
    (connection: any) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  // const demoNodes: Node[] = [
  //   { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
  //   { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },
  // ];

  // const edges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

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

  const nodeTypes = useMemo(() => ({ task: TaskNode, httpTask: HttpTaskNode }), []);

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
