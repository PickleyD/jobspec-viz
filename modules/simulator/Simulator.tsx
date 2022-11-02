import { ExpanderPanel } from "../../components"
import { BeakerIcon, ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";

const testModeSelector = (state: any) => state.matches("testMode");
const testModeLoadingSelector = (state: any) => state.matches("testModeLoading");
const taskInstructionsSelector = (state: any) => state.context.parsedTaskOrder
const currentTaskIndexSelector = (state: any) => state.context.currentTaskIndex
const taskRunResultsSelector = (state: any) => state.context.taskRunResults

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

  const currentTaskIndex = useSelector(
    globalServices.workspaceService,
    currentTaskIndexSelector
  )

  const taskRunResults = useSelector(
    globalServices.workspaceService,
    taskRunResultsSelector
  )

  const handleToggleTestMode = () => {
    setProgress(0)
    return globalServices.workspaceService.send("TOGGLE_TEST_MODE");
  };

  const [progress, setProgress] = useState<number>(0)

  const handlePrevIndex = () => {
    const nextCurrentIndex = currentTaskIndex - 1
    if (nextCurrentIndex >= 0) {
      globalServices.workspaceService.send("SIMULATOR_PREV_TASK")
    }
  }

  const handleNextIndex = () => {
    const nextCurrentIndex = currentTaskIndex + 1
    if (nextCurrentIndex <= taskInstructions.length) {
      globalServices.workspaceService.send("TRY_RUN_CURRENT_TASK")
    }
  }

  useEffect(() => {
    setProgress(taskInstructions.length > 0 ? (100 / taskInstructions.length) * (currentTaskIndex) : 0)
  }, [currentTaskIndex])

  const getTaskId = (index: number) => {
    return taskInstructions[index]?.id
  }

  const latestTaskRunResult = taskRunResults.length > 0 ? taskRunResults[taskRunResults.length - 1].result : {}

  return <ExpanderPanel className={className} icon={BeakerIcon}>
    <div className="flex items-center justify-center p-4">
      <div className="w-full flex flex-col items-start justify-start gap-4 max-w-[14rem]">
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
          <progress className={`${testMode ? "" : "disabled"} progress bg-gray-800 ${testModeLoading ? "" : "progress-secondary"} w-56`} value={testModeLoading ? undefined : progress} max="100"></progress>
        </div>
        <div className="flex flex-col gap-1 w-full">
          {(latestTaskRunResult.value || latestTaskRunResult.error) && <p className="text-xs text-gray-300">Current Result:</p>}
          <div className="flex flex-col gap-1">
            {
              latestTaskRunResult.value && <div className="flex flex-col">
                <p className="text-sm text-gray-300">Value:</p>
                <p className="text-sm text-secondary overflow-auto max-h-[10rem]">{latestTaskRunResult.value}</p>
              </div>
            }
            {
              latestTaskRunResult.error && <div className="flex flex-col">
                <p className="text-sm text-gray-300">Error:</p>
                <p className="text-sm text-error overflow-auto max-h-[10rem]">{latestTaskRunResult.error}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  </ExpanderPanel>
}