import { CogIcon, CodeBracketSquareIcon, BeakerIcon } from "@heroicons/react/24/solid"
import { useState } from "react"

export interface SideMenuProps {
    selectedIndex: number
    onSelectedIndexChange: (newIndex: number) => void
}

export const SideMenu = ({ selectedIndex, onSelectedIndexChange }: SideMenuProps) => {

    return <div className="pointer-events-auto relative menu h-full text-base-content shadow-lg border-gray-700 border-l border-b border-t rounded-bl-lg bg-base-100">
        <div className="absolute bg-noise opacity-25 inset-0 rounded-bl-lg" />
        <div className="flex flex-col gap-8 h-full">
            <div className="relative h-full">
                <div className={`transition-transform ${getMenuItemShineTranslate(selectedIndex)} absolute h-[80px] w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent left-[-1px]`} />
                <ul className="flex flex-col items-start">
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(0)}>
                        <label>
                            <CogIcon className={`${selectedIndex === 0 ? "fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(1)}>
                        <label>
                            <CodeBracketSquareIcon className={`${selectedIndex === 1 ? "fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(2)}>
                        <label>
                            <BeakerIcon className={`${selectedIndex === 2 ? "fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                </ul>
            </div>
        </div>
    </div>
}

const getMenuItemShineTranslate = (index: number) => {
    switch (index) {
        case 0:
            return "translate-y-[-10px]"
        case 1:
            return "translate-y-[50px]"
        case 2:
            return "translate-y-[110px]"
    }
}