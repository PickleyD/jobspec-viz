import { Tooltip } from "../../components";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { useSelector } from "@xstate/react";
import empty from "../../examples/empty.json";
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
            <div className="flex items-center justify-start gap-2 mb-4">
                <h4 className="uppercase text-sm font-bold tracking-wider text-gray-400">Templates</h4>
                <Tooltip className="text-sm text-gray-300">
                    <p>
                        Select from a preconfigured template job spec to get you started.
                    </p>
                </Tooltip>
            </div>
            <div className="flex flex-col">
                <Button variant="ghost"
                    onClick={() => handleRehydrate(empty)}
                >
                    Empty Project
                </Button>
                <Separator orientation="vertical" />
                <Button variant="ghost"
                    onClick={() => handleRehydrate(ethCall)}
                >{`ETH Call`}</Button>
                <Separator orientation="vertical" />
                <Button variant="ghost"
                    onClick={() => handleRehydrate(getUint256)}
                >{`Get -> Uint256`}</Button>
                <Separator orientation="vertical" />
                <Button variant="ghost"
                    onClick={() => handleRehydrate(median)}
                >{`Median Answer`}</Button>
            </div>
        </>
    );
};
