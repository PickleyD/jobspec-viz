import ReactFlow, {
  Controls,
  BackgroundProps,
  Node,
  Edge,
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
import { useContext } from "react";
import { useDrop } from "react-dnd";

const nodesSelector = (state: any) => state.context.nodes;

const nodeTypes = {
  task: TaskNode,
};

export interface FlowProps {
  className?: string;
}

export const Flow = ({ className }: FlowProps) => {
  const topLevelStyles = clsx(className, "h-full w-full");

  const globalServices = useContext(GlobalStateContext);
  const nodes = useSelector(globalServices.workspaceService, nodesSelector);

  const nodeToFlowElement = (node: any) => {
    const nodeType = node.ref.machine.id;

    let flowElement = {
      id: node.ref.id,
      type: "",
      data: {},
      position: { x: 0, y: 0 },
    };

    switch (nodeType) {
      case "task":
        flowElement.type = "task";
        break;
    }

    return flowElement;
  };

  const elements = [...nodes.tasks.map(nodeToFlowElement)];

  const demoNodes: Node[] = [
    { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
    { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },
  ];

  const edges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

  type XYCoords = {
    x: number;
    y: number;
  };

  /**
   * Handle drop event. This will mean a new node from
   * the toolbar has been dragged over the flow and dropped.
   * @param item
   * @param monitor
   */
  const handleDrop = (item: any, monitor: any) => {
    console.log(item);
    console.log(monitor);

    const clientOffset = monitor.getClientOffset() as XYCoords;

    handleAddNewNode(clientOffset);
  };

  const handleAddNewNode = (initialCoords: XYCoords) => {
    globalServices.workspaceService.send("NEW_NODE_TASK.ADD", {
      options: {
        initialCoords,
      },
    });
  };

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
    []
  );

  return (
    <div className={topLevelStyles} ref={dropRef}>
      <ReactFlow
        // elements={elements}
        nodes={demoNodes}
        edges={edges}
        // nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Controls />
        <Background gap={15} />
      </ReactFlow>
    </div>
  );
};
