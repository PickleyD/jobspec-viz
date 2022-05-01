import ReactFlow, {
  Controls,
  BackgroundProps,
  ReactFlowProvider,
  ReactFlowInstance
} from "react-flow-renderer";
import dynamic, { DynamicOptions, Loader } from "next/dynamic";
const Background = dynamic<BackgroundProps>(
  import("react-flow-renderer").then((mod) => mod.Background) as
    | DynamicOptions<{}>
    | Loader<{}>,
  { ssr: false }
); // disable ssr
import { TaskNode } from "./nodes";
import clsx from "clsx";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import { XYCoords } from "../workspace/taskNodeMachine";

const nodesSelector = (state: any) => state.context.nodes;

export interface FlowProps {
  className?: string;
}

export const Flow = ({ className }: FlowProps) => {
  const topLevelStyles = clsx(className, "h-full w-full");

  const globalServices = useContext(GlobalStateContext);
  const nodes = useSelector(globalServices.workspaceService, nodesSelector);

  const nodeToFlowElement = (node: any) => {
    const nodeType = node.ref.machine.id;

    const { initialCoords } = node.ref.state.context;

    let flowElement = {
      id: node.ref.id,
      type: "",
      data: {},
      position: initialCoords,
    };

    switch (nodeType) {
      case "taskNode":
        flowElement.type = "task";
        break;
    }

    return flowElement;
  };

  const elements = [...nodes.tasks.map(nodeToFlowElement)];

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

    const position = reactFlowInstance?.project(clientOffset) || { x: 0, y: 0};

    handleAddNewNode(position);
  };

  const handleAddNewNode = (initialCoords: XYCoords) => {
    globalServices.workspaceService.send("NEW_TASK_NODE.ADD", {
      options: {
        initialCoords,
      },
    });
  };

  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

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

  const nodeTypes = useMemo(() => ({ task: TaskNode }), []);

  return (
    <ReactFlowProvider>
      <div className={topLevelStyles} ref={dropRef}>
        <ReactFlow
          nodes={elements}
          edges={[]}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[15, 15]}
          onInit={setReactFlowInstance}
        >
          <Controls />
          <Background gap={15} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};
