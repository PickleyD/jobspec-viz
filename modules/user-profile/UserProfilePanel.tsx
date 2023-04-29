import { ExpanderPanel, Tooltip } from "../../components";
import {
    UserIcon
} from "@heroicons/react/24/outline";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConnectWallet } from "@thirdweb-dev/react";

export interface UserProfilePanelProps {
    className?: string;
}

export const UserProfilePanel = ({ className = "" }: UserProfilePanelProps) => {
    const globalServices = useContext(GlobalStateContext);

    const queryClient = useQueryClient()

    const { data, error, isLoading } = useQuery({
        queryKey: ["getJobSpecs"], queryFn: () => fetch("/api/job-specs").then(res => {
            if (res.status !== 200) {
                return new Error("An error occurred")
            }

            return res.json()
        })
    })

    const handleLoadJobSpecVersion = (jsonContent: any) => {
        globalServices.workspaceService.send("RESTORE_STATE", {
            savedContext: jsonContent,
        })
    }

    return (
        <>
            <div className="flex items-center justify-start gap-2 mb-4">
                <h4 className="uppercase text-sm font-bold tracking-wider text-gray-400">My profile</h4>
                <Tooltip className="text-sm text-gray-300">
                    <p>
                        Connect your wallet and sign in to save your job specs and keep them synced across your devices.
                    </p>
                </Tooltip>
            </div>
            <div className="flex-col items-center justify-end p-4 w-80">
                <div className="py-8">
                    <ConnectWallet
                        btnTitle="Connect Wallet"
                        theme="light"
                        className="!bg-base-100 !text-white !rounded-full !p-4 !border-solid !border-2 !border-base-100 hover:!border-secondary focus:!ring-0"
                        auth={{
                            loginOptional: false,
                            loginOptions: {
                                domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN
                            }
                        }}
                    />
                </div>
                <h4 className="font-bold">Your Job Specs</h4>
                <ul>
                    {isLoading ? "LOADING..." : error ? data.map((spec: any, index: number) => <ul key={index} onClick={() => handleLoadJobSpecVersion(spec.job_spec_versions[0].content)}>
                        {spec.job_spec_versions[0].name ?? `Unnamed ${index + 1}`}
                    </ul>) : <span>{error as string}</span>}
                </ul>
            </div>
        </>
    );
};
