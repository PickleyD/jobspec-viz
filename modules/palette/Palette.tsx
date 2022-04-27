import { PlusIcon, XIcon } from "@heroicons/react/solid"
import { useState } from "react"
import { TaskChip } from "./TaskChip"

export const Palette = () => {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return <div className="relative">
        <label
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute z-10 right-0 top-0 btn btn-circle swap swap-rotate ${isOpen ? "swap-active" : ""}`}
        >
            <PlusIcon className="swap-off fill-current h-5 w-5 text-blue-500" />
            <XIcon className="swap-on fill-current h-5 w-5 text-blue-500" />
        </label>
        <div className={`p-2 relative z-0 transition-all origin-top-right ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-50"} w-40 h-40 bg-base-300 rounded rounded-tr-3xl`}>
            <div className="text-base uppercase underline underline-offset-4 py-1 w-fit font-bold tracking-widest">
                Tasks
            </div>
            <ul className="py-2 flex flex-col gap-1">
                <li><TaskChip name="Sum"/></li>
                <li><TaskChip name="Divide"/></li>
                <li><TaskChip name="Median"/></li>
            </ul>
        </div>
    </div>
}