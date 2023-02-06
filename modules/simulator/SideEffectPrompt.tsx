import { TextArea } from "../flow/nodes/fields";
import { useContext } from "react";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";

const taskRunResultsSelector = (state: any) => state.context.taskRunResults;
const currentTaskMockResponseDataInputSelector = (state: any) => {
    const currentTaskMachine = state.context.nodes.tasks.find((task: any) => task.ref.id === state.context.parsedTaskOrder[state.context.currentTaskIndex]?.id)?.ref;

    return currentTaskMachine?.state.context.mock.mockResponseData
}

export const SideEffectPrompt = () => {
    const globalServices = useContext(GlobalStateContext);

    const currentTaskMockResponseDataInput = useSelector(
        globalServices.workspaceService,
        currentTaskMockResponseDataInputSelector
    );

    const taskRunResults = useSelector(
        globalServices.workspaceService,
        taskRunResultsSelector
    );

    const latestTaskRunResult =
        taskRunResults.length > 0
            ? taskRunResults[taskRunResults.length - 1].result
            : {};

    const sideEffectJson = JSON.parse(latestTaskRunResult.sideEffectData)

    const handleMakeCall = () => {
        globalServices.workspaceService.send("TRY_RUN_CURRENT_SIDE_EFFECT");
    }

    return <div className="text-sm">
        <h4>This task would typically execute an <span className="text-secondary">ETH Call</span> with the following parameters:</h4>
        <li className="list-none">
            {
                Object.keys(sideEffectJson).map(key => <ul>
                    <p className="flex gap-1">
                        <span className="text-secondary">{key}:</span>
                        <span>{sideEffectJson[key]}</span>
                    </p>
                </ul>
                )
            }
        </li>
        <p>
            Use the currently stored mock response for this task or execute the side-effect and overwrite the stored mock response with the result?
        </p>
        <h4>Current Mock Response</h4>
        <TextArea
            disabled
            className="h-48"
            value={currentTaskMockResponseDataInput}
        />
        <button className="border-2 border-white" onClick={handleMakeCall}>Make Eth Call</button>
    </div>
}