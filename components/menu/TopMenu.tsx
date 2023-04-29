export interface TopMenuProps {
    lit?: boolean;
    className?: string;
}

export const TopMenu = ({ lit = false, className = "" }: TopMenuProps) => {

    return <div className="pointer-events-auto relative text-base-content shadow-lg border-gray-700 border rounded-tl-lg rounded-tr-lg bg-base-100">
        <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute h-px w-20 left-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent top-[-1px]`} />
        <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute w-px h-10 top-1 bg-gradient-to-b from-transparent via-gray-500 to-transparent left-[-1px]`} />
        <div className="absolute bg-noise opacity-25 inset-0 rounded-tl-lg rounded-tr-lg" />
        <div className="flex flex-col gap-8 h-full">
            <div className="flex items-start gap-1 relative p-4">
                <div className="flex items-center justify-center h-3 w-3 overflow-visible">
                    <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute bg-gradient-radial from-white/30 via-transparent to-transparent w-12 h-12`} />
                    <div className="rounded-full h-3 w-3 bg-[#ffaaaa]" />
                </div>
                <div className="flex items-center justify-center h-3 w-3 overflow-visible">
                    <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute bg-gradient-radial from-white/30 via-transparent to-transparent w-12 h-12`} />
                    <div className="rounded-full h-3 w-3 bg-[#ffeeaa]" />
                </div>
                <div className="flex items-center justify-center h-3 w-3 overflow-visible">
                    <div className={`transition-opacity ${lit ? "opacity-100" : "opacity-0"} absolute bg-gradient-radial from-white/30 via-transparent to-transparent w-12 h-12`} />
                    <div className="rounded-full h-3 w-3 bg-[#aaeeff]" />
                </div>
            </div>
        </div>
    </div>
}
