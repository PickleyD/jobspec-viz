import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { Edge } from "react-flow-renderer";

const nodesSelector = (state: any) => state.context.nodes;
const edgesSelector = (state: any) => state.context.edges;

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const outgoingNodesSelector = (state: any) => state.context.outgoingNodes;

export const Codegen = () => {
  const globalServices = useContext(GlobalStateContext);
  const nodesFromMachine = useSelector(
    globalServices.workspaceService,
    nodesSelector
  );
  const edgesFromMachine = useSelector(
    globalServices.workspaceService,
    edgesSelector
  );

  const tasks = [
    ...Array.from(
      new Set([
        ...edgesFromMachine
          .map((edge: Edge) => edge.source)
          .filter(
            (value: string, index: number, self: Array<string>) =>
              self.indexOf(value) === index
          ),
        ...edgesFromMachine
          .map((edge: Edge) => edge.target)
          .filter(
            (value: string, index: number, self: Array<string>) =>
              self.indexOf(value) === index
          ),
      ])
    ),
  ];

  return <div className="w-80 h-80 bg-blue-700">{JSON.stringify(tasks)}</div>;
};
