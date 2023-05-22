import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export interface TooltipProps {
    children: React.ReactNode;
    className?: string;
}

export const Tooltip = ({ children, className = "" }: TooltipProps) => {

    return <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline" className="w-6 h-6 rounded-full group transition-colors hover:bg-foreground p-0">
                <InformationCircleIcon className="h-4 w-4 group-hover:stroke-background" />
                <span className="sr-only">Open tooltip</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className={`${className} w-80`}>
            {children}
        </PopoverContent>
    </Popover>
}