import { ExpanderPanel } from "../../components"
import { BeakerIcon } from "@heroicons/react/24/outline"
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { useSelector } from "@xstate/react";

const testModeSelector = (state: any) => state.matches("testMode");

export interface SimulatorProps {
  className?: string;
}

export const Simulator = ({ className = "" }: SimulatorProps) => {

  const globalServices = useContext(GlobalStateContext);

  const testMode = useSelector(
    globalServices.workspaceService,
    testModeSelector
  );

  const handleToggleTestMode = () => {
    return globalServices.workspaceService.send("TOGGLE_TEST_MODE");
  };

  return <ExpanderPanel className={className} icon={BeakerIcon}>
    <div className="flex items-center justify-center">
      <div className="p-12">
        <button className="btn glass" onClick={handleToggleTestMode}>{testMode ? "Exit Test Mode" : "Enter Test Mode"}</button>
      </div>
    </div>
  </ExpanderPanel>
}