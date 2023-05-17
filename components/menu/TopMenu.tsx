import Image from "next/image";

export interface TopMenuProps {
    lit?: boolean;
    className?: string;
    onToggleClick?: () => void;
}

export const TopMenu = ({ lit = false, onToggleClick = () => { }, className = "" }: TopMenuProps) => {

    return <div className="">
        <div className={`${lit ? "rounded-tl-lg rounded-tr-lg" : "rounded-lg border-b"} w-fit pointer-events-auto relative text-base-content shadow-lg border-accent border-l border-t border-r bg-[#0D0F0B] flex`}>
            <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute h-px w-20 left-1 bg-gradient-to-r from-transparent via-accent-foreground to-transparent top-[-1px]`} />
            <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute w-px h-10 top-1 bg-gradient-to-b from-transparent via-accent-foreground to-transparent left-[-1px]`} />
            <div title="Toggle sidebar" className="hover:bg-white/5 rounded transition-colors flex items-start p-2 w-fit cursor-pointer" onClick={() => onToggleClick()}>
                <div className={`${lit ? "rounded-t-lg" : "rounded-lg"} absolute inset-0 bg-noise opacity-[.15] pointer-events-inherit`} />
                <div className="p-2 flex gap-1">
                    <div className="flex items-center justify-center h-3 w-3 overflow-visible">
                        <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute bg-gradient-radial from-white/30 via-transparent to-transparent w-12 h-12`} />
                        <div className={`${lit ? "bg-[#ffaaaa]" : "bg-[#ff6a6a]"} rounded-full h-3 w-3`} />
                    </div>
                    <div className="flex items-center justify-center h-3 w-3 overflow-visible">
                        <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute bg-gradient-radial from-white/30 via-transparent to-transparent w-12 h-12`} />
                        <div className={`${lit ? "bg-[#aaeeff]" : "bg-[#6ae1ff]"} rounded-full h-3 w-3`} />
                    </div>
                    <div className="flex items-center justify-center h-3 w-3 overflow-visible">
                        <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute bg-gradient-radial from-white/30 via-transparent to-transparent w-12 h-12`} />
                        <div className={`${lit ? "bg-[#ffeeaa]" : "bg-[#ffe16a]"} rounded-full h-3 w-3`} />
                    </div>
                </div>

                <div className="h-full w-20 relative">
                    <Image src="/linkit.svg" alt="linkit logo" layout="fill" />
                </div>
            </div>
        </div>
    </div >
}
