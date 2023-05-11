import { CogIcon, CodeBracketSquareIcon, BeakerIcon, UserIcon, AcademicCapIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid"

export interface SideMenuProps {
    selectedIndex: number
    onSelectedIndexChange: (newIndex: number) => void
}

export const SideMenu = ({ selectedIndex, onSelectedIndexChange }: SideMenuProps) => {

    return <div className="pointer-events-auto relative flex flex-col h-full text-base-content rounded-bl-lg bg-transparent">

        <div className={`transition-opacity absolute h-px w-20 left-1 bg-gradient-to-r from-transparent via-accent-foreground to-transparent top-[-1px]`} />
        <div className="flex flex-col gap-8 h-full">
            <div className="relative h-full">
                <div className={`transition-transform ${getMenuItemShineTranslate(selectedIndex)} absolute h-[80px] w-[2px] bg-gradient-to-b from-transparent via-accent-foreground to-transparent left-[-1px] opacity-50`} />
                <ul className="flex flex-col items-start">
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(0)}>
                        <label className="hover:bg-primary/10 gap-3 py-3 px-4 cursor-pointer flex items-center">
                            <AcademicCapIcon className={`${selectedIndex === 0 ? "drop-shadow-[0_0_8px_rgba(255,255,255,1)] fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(1)}>
                        <label className="hover:bg-primary/10 gap-3 py-3 px-4 cursor-pointer flex items-center">
                            <UserIcon className={`${selectedIndex === 1 ? "drop-shadow-[0_0_8px_rgba(255,255,255,1)] fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(2)}>
                        <label className="hover:bg-primary/10 gap-3 py-3 px-4 cursor-pointer flex items-center">
                            <CogIcon className={`${selectedIndex === 2 ? "drop-shadow-[0_0_8px_rgba(255,255,255,1)] fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(3)}>
                        <label className="hover:bg-primary/10 gap-3 py-3 px-4 cursor-pointer flex items-center">
                            <CodeBracketSquareIcon className={`${selectedIndex === 3 ? "drop-shadow-[0_0_8px_rgba(255,255,255,1)] fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(4)}>
                        <label className="hover:bg-primary/10 gap-3 py-3 px-4 cursor-pointer flex items-center">
                            <BeakerIcon className={`${selectedIndex === 4 ? "drop-shadow-[0_0_8px_rgba(255,255,255,1)] fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
                        </label>
                    </li>
                    <li className="group h-[60px]" onClick={() => onSelectedIndexChange(5)}>
                        <label className="hover:bg-primary/10 gap-3 py-3 px-4 cursor-pointer flex items-center">
                            <ChatBubbleLeftRightIcon className={`${selectedIndex === 5 ? "drop-shadow-[0_0_8px_rgba(255,255,255,1)] fill-white" : "fill-gray-600"} h-8 w-8 transition-colors group-hover:fill-white`} />
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
        case 3:
            return "translate-y-[170px]"
        case 4:
            return "translate-y-[230px]"
        case 5:
            return "translate-y-[290px]"
    }
}