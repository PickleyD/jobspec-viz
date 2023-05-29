import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface TaskConfigTabsProps {
    defaultValue?: string;
    config?: React.ReactNode;
    test?: React.ReactNode;
}

export const TaskConfigTabs = ({ defaultValue = "config", config = <></>, test = <></> }: TaskConfigTabsProps) => {

    return <div className="w-full p-2 bg-background rounded-lg">
        <Tabs defaultValue={defaultValue} className="">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">Config</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>
            <TabsContent value="config">
                {config}
            </TabsContent>
            <TabsContent value="test">
                {test}
            </TabsContent>
        </Tabs>
    </div>
}