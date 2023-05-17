import { TextArea } from "../flow/nodes/fields";
import { useContext } from "react";
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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

    const handleSkipCall = () => {
        globalServices.workspaceService.send("SKIP_CURRENT_SIDE_EFFECT");
    }

    return <div className="w-full text-xs flex flex-col gap-2">
        <h4>This task would typically execute an <span className="text-secondary">ETH Call</span> with the following parameters:</h4>
        <li className="list-none w-full overflow-x-scroll bg-muted flex flex-col gap-1 p-2">
            {
                Object.keys(sideEffectJson).map(key => <ul>
                    <p className="flex gap-1">
                        <span className="text-secondary">{key}:</span>
                        <span className="text-gray-300">{sideEffectJson[key]}</span>
                    </p>
                </ul>
                )
            }
        </li>
        <div className="flex flex-col w-full gap-4 py-4">
            <Button variant="secondary" className="text-xs" onClick={handleMakeCall}>Run and Overwrite the Stored Mock Response</Button>
            <div className="flex gap-2 w-full items-center">
                <Separator orientation="horizontal" className="shrink"/>
                <span>OR</span>
                <Separator orientation="horizontal" className="shrink"/>
            </div>
            <Button variant="outline" className="text-xs" onClick={handleSkipCall}>Skip and Use Currently Stored Mock Response</Button>
        </div>
        <h4>Stored Mock Response</h4>
        <TextArea
            disabled
            className="text-xs"
            value={currentTaskMockResponseDataInput}
            placeholder="No mock response set on task"
        />
    </div>
}