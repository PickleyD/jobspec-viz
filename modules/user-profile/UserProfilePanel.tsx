import { Tooltip } from "../../components";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConnectWallet, useUser } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";

export interface UserProfilePanelProps {
    className?: string;
}

export const UserProfilePanel = ({ className = "" }: UserProfilePanelProps) => {
    const globalServices = useContext(GlobalStateContext);

    const queryClient = useQueryClient()

    const { isLoggedIn } = useUser()

    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: ["getJobSpecs"],
        queryFn: () => fetch("/api/job-specs").then(res => {
            if (res.status !== 200) {
                throw new Error("An error occurred")
            }

            return res.json()
        }),
        enabled: isLoggedIn
    })

    const handleSaveJobSpecVersion = () => {
        globalServices.workspaceService.send("SAVE_JOB_SPEC_VERSION")
    }

    const handleLoadJobSpecVersion = (jsonContent: any) => {
        globalServices.workspaceService.send("RESTORE_STATE", {
            savedContext: jsonContent,
        })
    }

    const renderJobSpecs = ({ data, error, isLoading, isFetching }: { data: any, error: unknown, isLoading: boolean, isFetching: boolean }) => {

        if (!isFetching && !data && !error) return null

        if (isLoading) return <span>Loading...</span>

        if (error) return <span>An error occurred</span>

        const hasNoJobSpecs = !isLoading && !error && data.length < 1
        if (hasNoJobSpecs) return <span>No saved job specs... yet.</span>

        return data.map((spec: any, index: number) => <ul key={index} onClick={() => handleLoadJobSpecVersion(spec.job_spec_versions[0].content)}>
            {spec.job_spec_versions[0].name ?? `Unnamed ${index + 1}`}
        </ul>)
    }

    return (
        <>
            <div className="flex items-center justify-start gap-2 mb-6">
                <h4 className="uppercase text-sm font-bold tracking-wider text-muted-foreground">My profile</h4>
                <Tooltip className="text-sm text-muted-foreground">
                    <p>
                        Connect your wallet and sign in to save your job specs and keep them synced across your devices.
                    </p>
                </Tooltip>
            </div>
            <div className="flex-col w-80 gap-8 flex">
                <div className="flex justify-start">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <ConnectWallet
                            btnTitle="Connect Wallet"
                            theme="light"
                            className="!bg-background !text-muted-foreground !rounded-full !p-4 !border-solid !border-2 !border-background hover:!border-secondary focus:!ring-0"
                            auth={{
                                loginOptional: false,
                                loginOptions: {
                                    domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className={`${isLoggedIn ? "" : "text-muted-foreground"} font-bold`}>My Saved Job Specs</h4>
                    {
                        !isLoggedIn && <p className="text-xs italic p-4">Sign in to save/load your job specs</p>
                    }
                    <ul>
                        {renderJobSpecs({ data, error, isLoading, isFetching })}
                    </ul>
                    <Button onClick={handleSaveJobSpecVersion}>Save Job Spec</Button>
                </div>
            </div>
        </>
    );
};