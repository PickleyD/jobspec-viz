import { Popover as HeadlessPopover, Transition } from "@headlessui/react"
import { Float } from '@headlessui-float/react';

export interface PopoverProps {
    content: React.ReactNode;
    label: (open: boolean) => React.ReactNode;
}

export const Popover = ({ content, label }: PopoverProps) => {

    return <HeadlessPopover className="isolate">
        {({ open }) => (
            <Float portal placement="bottom" autoUpdate={{ animationFrame: true }}>
                <HeadlessPopover.Button className="focus:outline-none">
                    {label(open)}
                </HeadlessPopover.Button>
                <Transition
                    className="z-10"
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                >
                    <HeadlessPopover.Panel className="flex flex-col items-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" className="fill-secondary">
                            <polygon points="0,10 5,5 10,10" />
                        </svg>
                        <div className={`bg-base-300 rounded-lg border border-secondary`}>
                            {content}
                        </div>
                    </HeadlessPopover.Panel>
                </Transition>
            </Float>
        )}
    </HeadlessPopover>
}