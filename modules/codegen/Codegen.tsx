import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";

const nodesSelector = (state: any) => state.context.nodes;
const edgesSelector = (state: any) => state.context.edges;

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

  return (
    <div className="w-80 h-80 bg-blue-700">
      {JSON.stringify(edgesFromMachine)}
    </div>
  );
};
