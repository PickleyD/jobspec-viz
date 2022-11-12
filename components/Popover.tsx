import { Popover as HeadlessPopover } from "@headlessui/react"
import { Float } from '@headlessui-float/react';
import type { Placement } from '@floating-ui/dom';

export interface PopoverProps {
    className?: string;
    content: React.ReactNode;
    label: (open: boolean) => React.ReactNode;
    placement?: Extract<Placement, "bottom" | "bottom-start" | "bottom-end">;
}

export const Popover = ({ className = "", content, label, placement = "bottom" }: PopoverProps) => {

    return <HeadlessPopover className={`isolate ${className}`}>
        {({ open }) => (
            <Float
                className="z-10"
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
                portal
                placement={placement}
                autoUpdate={{ animationFrame: true }}>
                <HeadlessPopover.Button className="focus:outline-none grid">
                    {label(open)}
                </HeadlessPopover.Button>
                <HeadlessPopover.Panel className={`flex flex-col
                ${placement === "bottom-start" ? "items-start" : ""}
                ${placement === "bottom" ? "items-center" : ""}
                ${placement === "bottom-end" ? "items-end" : ""}
                `}>
                    <svg width="24" height="10" viewBox="0 0 10 10" className="fill-secondary">
                    <polygon points="0,10 5,5 10,10" />
                    </svg>
                    <div className={`bg-base-300 rounded-lg border border-secondary`}>
                        {content}
                    </div>
                </HeadlessPopover.Panel>
            </Float>
        )}
    </HeadlessPopover>
}