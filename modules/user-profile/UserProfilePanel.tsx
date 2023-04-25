import { ExpanderPanel, Tooltip } from "../../components";
import {
    UserIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// const isTestModeSelector = (state: any) => state.matches("testMode");

export interface UserProfilePanelProps {
    className?: string;
}

export const UserProfilePanel = ({ className = "" }: UserProfilePanelProps) => {
    const globalServices = useContext(GlobalStateContext);

    //   const testMode = useSelector(
    //     globalServices.workspaceService,
    //     isTestModeSelector
    //   );

    const queryClient = useQueryClient()

    const { data, error, isLoading } = useQuery({
        queryKey: ["getJobSpecs"], queryFn: () => fetch("/api/job-specs").then(res => res.json())
    })

    return (
        <ExpanderPanel className={className} icon={UserIcon}>
            <div className="flex items-center justify-center p-4">
                {isLoading ? "LOADING..." : JSON.stringify(data)}
            </div>
        </ExpanderPanel>
    );
};
