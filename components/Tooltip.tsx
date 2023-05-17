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
            <Button variant="outline" className="w-6 h-6 rounded-full p-0">
                <InformationCircleIcon className="h-4 w-4" />
                <span className="sr-only">Open tooltip</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className={`${className} w-80`}>
            {children}
        </PopoverContent>
    </Popover>
}