import { ExpanderPanel } from "../../components"
import { BeakerIcon, ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useState } from "react";
import { useSelector } from "@xstate/react";

const testModeSelector = (state: any) => state.matches("testMode");
const testModeLoadingSelector = (state: any) => state.matches("testModeLoading");
const taskInstructionsSelector = (state: any) => state.context.parsedTaskOrder

export interface SimulatorProps {
  className?: string;
}

export const Simulator = ({ className = "" }: SimulatorProps) => {

  const globalServices = useContext(GlobalStateContext);

  const testMode = useSelector(
    globalServices.workspaceService,
    testModeSelector
  );

  const testModeLoading = useSelector(
    globalServices.workspaceService,
    testModeLoadingSelector
  );

  const taskInstructions = useSelector(
    globalServices.workspaceService,
    taskInstructionsSelector
  );

  const handleToggleTestMode = () => {
    setProgress(0)
    return globalServices.workspaceService.send("TOGGLE_TEST_MODE");
  };

  const [progress, setProgress] = useState<number>(0)

  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0)

  const handlePrevIndex = () => {
    const nextCurrentIndex = currentTaskIndex - 1
    if (nextCurrentIndex >= 0) {
      setCurrentTaskIndex(nextCurrentIndex)
      setProgress((100 / taskInstructions.length) * (nextCurrentIndex))
    }
  }

  const handleNextIndex = () => {
    const nextCurrentIndex = currentTaskIndex + 1
    if (nextCurrentIndex <= taskInstructions.length) {
      setCurrentTaskIndex(nextCurrentIndex)
      setProgress((100 / taskInstructions.length) * (nextCurrentIndex))
    }
  }

  const getTaskId = (index: number) => {
    return taskInstructions[index]?.id
  }

  return <ExpanderPanel className={className} icon={BeakerIcon}>
    <div className="flex items-center justify-center p-4">
      <div className="w-full flex flex-col items-start justify-start gap-4">
        <label className="label cursor-pointer flex gap-2">
          <span className="label-text">Test Mode</span>
          <input type="checkbox" className="toggle toggle-secondary" checked={testMode || testModeLoading} onChange={handleToggleTestMode} />
        </label>
        <div className="flex flex-col gap-2">
          <div className="btn-group flex flex-row w-full">
            <button onClick={handlePrevIndex} disabled={!testMode || currentTaskIndex === 0} className={`${testMode ? "" : "btn-disabled"} btn border-gray-800 hover:border-secondary focus:border-secondary btn-sm`}><ChevronLeftIcon className="w-5 h-5" /></button>
            <div className={`${testMode ? "" : "btn-disabled"} btn grow pointer-events-none cursor-default btn-sm normal-case`}>{testModeLoading ? "Loading..." : (currentTaskIndex >= taskInstructions.length || !testMode) ? <CheckCircleIcon className="w-5 h-5" /> : getTaskId(currentTaskIndex)}</div>
            <button onClick={handleNextIndex} disabled={!testMode || currentTaskIndex >= taskInstructions.length} className={`${testMode ? "" : "btn-disabled"} btn border-gray-800 hover:border-secondary focus:border-secondary btn-sm`}><ChevronRightIcon className="w-5 h-5" /></button>
          </div>
          <progress className={`${testMode ? "" : "disabled"} progress bg-gray-800 ${testModeLoading ? "" : "progress-secondary"} w-48`} value={testModeLoading ? undefined : progress} max="100"></progress>
        </div>
      </div>
    </div>
  </ExpanderPanel>
}