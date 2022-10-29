import { ExpanderPanel } from "../../components"
import { BeakerIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline"
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { useSelector } from "@xstate/react";

const testModeSelector = (state: any) => !state.matches("idle");

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
    <div className="flex items-center justify-center p-4">
      <div className="w-full flex flex-col items-start justify-start gap-4">
        <label className="label cursor-pointer flex gap-2">
          <span className="label-text">Test Mode</span>
          <input type="checkbox" className="toggle toggle-secondary" checked={testMode} onChange={handleToggleTestMode} />
        </label>
        <div className="flex flex-col gap-2">
          <div className="btn-group flex flex-row w-full">
            <button disabled={!testMode} className={`${testMode ? "" : "btn-disabled"} btn border-gray-800 hover:border-secondary focus:border-secondary btn-sm`}><ChevronLeftIcon className="w-5 h-5" /></button>
            <div className={`${testMode ? "" : "btn-disabled"} btn grow pointer-events-none cursor-default btn-sm normal-case`}>The Task</div>
            <button disabled={!testMode} className={`${testMode ? "" : "btn-disabled"} btn border-gray-800 hover:border-secondary focus:border-secondary btn-sm`}><ChevronRightIcon className="w-5 h-5" /></button>
          </div>
          <progress className={`${testMode ? "" : "disabled"} progress bg-gray-800 progress-secondary w-48`} value={0} max="100"></progress>
        </div>
      </div>
    </div>
  </ExpanderPanel>
}