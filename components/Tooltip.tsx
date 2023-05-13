import { Popover, PopoverProps } from "./Popover"
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"

export interface TooltipProps extends Omit<PopoverProps, "label" | "content"> {
    children: React.ReactNode;
    className?: string;
}

export const Tooltip = ({ children, className = "", ...rest }: TooltipProps) => {

    return <Popover
        className="w-6 h-6"
        label={(open) => <label
            tabIndex={0}
            className={`border-muted-foreground focus:border hover:border hover:border-secondary focus:border-secondary bg-background h-6 w-6 min-h-0 btn btn-circle swap swap-rotate ${open ? "swap-active" : ""}`}
        >
            <InformationCircleIcon className="swap-off h-4 w-4 text-white" />
            <XMarkIcon className="swap-on h-4 w-4 text-white" />
        </label>}
        content={<div className={`p-4 max-w-sm flex flex-col gap-2 ${className}`}>
            {children}
        </div>}
        {...rest} />
}