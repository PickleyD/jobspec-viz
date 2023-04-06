import { useState } from "react"

export interface TaskConfigTabsProps {
    defaultValue?: string;
    config?: React.ReactNode;
    test?: React.ReactNode;
}

export const TaskConfigTabs = ({ defaultValue = "config", config = <></>, test = <></> }: TaskConfigTabsProps) => {

    const [currentTab, setCurrentTab] = useState(defaultValue)

    return <div className="flex flex-col w-full py-2">
        <div className="tabs">
            <a onClick={() => setCurrentTab("config")} className={`w-1/2 ${currentTab === "config" ? "tab-active before:!hidden after:!hidden" : ""} tab tab-lifted !border-gray-700`}>Config</a>
            <a onClick={() => setCurrentTab("test")} className={`w-1/2 ${currentTab === "test" ? "tab-active before:!hidden after:!hidden" : ""} tab tab-lifted !border-gray-700`}>Test</a>
        </div>
        <div className="grid grid-cols-1 grid-rows-1">
            <div className={`row-span-full col-span-full ${currentTab !== "config" ? "invisible" : ""}`}>{config}</div>
            <div className={`row-span-full col-span-full ${currentTab !== "test" ? "invisible" : ""}`}>{test}</div>
        </div>
    </div>
}