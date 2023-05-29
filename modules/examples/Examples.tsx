import { Tooltip } from "../../components";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { useSelector } from "@xstate/react";
import empty from "../../examples/empty.json";
import aiPrompt from "../../examples/aiPrompt.json";
import ethCall from "../../examples/ethcall.json";
import getUint256 from "../../examples/getUint256.json";
import median from "../../examples/median.json";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface ExamplesProps {
    className?: string;
}

const reactFlowInstanceSelector = (state: any) =>
    state.context.reactFlowInstance;

export const Examples = ({ className = "" }: ExamplesProps) => {
    const globalServices = useContext(GlobalStateContext);

    const reactFlowInstance = useSelector(
        globalServices.workspaceService,
        reactFlowInstanceSelector
    );

    const handleRehydrate = (json: any) => {
        globalServices.workspaceService.send("RESTORE_STATE", {
            savedContext: json,
        });
        setTimeout(
            () =>
                reactFlowInstance.fitView({
                    duration: 500,
                    padding: 1,
                }),
            100
        );
    };

    return (
        <>
            <div className="flex items-center justify-start gap-2 mb-6">
                <h4 className="uppercase text-sm font-bold tracking-wider text-muted-foreground">Quickstart Templates</h4>
                <Tooltip className="text-sm text-muted-foreground">
                    <p>
                        Select from a preconfigured template job spec to get you started.
                    </p>
                </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Button className="basis-1/2"
                    onClick={() => handleRehydrate(empty)}
                >
                    Empty Project
                </Button>
                {/* <Separator orientation="vertical" /> */}
                <Button className="basis-1/2"
                    onClick={() => handleRehydrate(aiPrompt)}
                >
                    AI Prompt
                </Button>
                {/* <Separator orientation="vertical" /> */}
                <Button className="basis-1/2" 
                    onClick={() => handleRehydrate(ethCall)}
                >{`ETH Call`}</Button>
                {/* <Separator orientation="vertical" /> */}
                <Button className="basis-1/2"
                    onClick={() => handleRehydrate(getUint256)}
                >{`Get -> Uint256`}</Button>
                {/* <Separator orientation="vertical" /> */}
                <Button className="basis-1/2"
                    onClick={() => handleRehydrate(median)}
                >{`Median Answer`}</Button>
            </div>
        </>
    );
};
