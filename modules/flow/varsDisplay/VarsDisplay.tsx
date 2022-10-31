import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

export interface VarsDisplayProps {
    vars: { [key: string]: string }
}

const SHOW_TRUNCATOR_CHARS_LIMIT = 150

export const VarsDisplay = ({ vars }: VarsDisplayProps) => {

    const [shrink, setShrink] = useState<boolean>(true)

    const toggleShrink = () => setShrink(!shrink)

    return <div className="p-4 max-w-sm flex flex-col gap-2">
        <h4 className="text-sm font-bold">Vars Snapshot</h4>
        <ul className="text-xs flex flex-col gap-2">
            {Object.keys(vars).map(key => {

                const showTruncator = vars[key] && vars[key].length > SHOW_TRUNCATOR_CHARS_LIMIT

                return <li className="flex flex-col gap-1">
                    <p className="font-bold text-secondary whitespace-nowrap">{key}:</p>
                    <div className="flex flex-row items-start w-full">
                        {showTruncator
                            ?
                            <button className={`basis-4 py-[2px] grow-0 items-start justify-start swap swap-rotate ${shrink ? "swap-active" : ""}`}>
                                <PlusIcon className="swap-off h-3 w-3 stroke-secondary" onClick={toggleShrink} />
                                <MinusIcon className="swap-on h-3 w-3 stroke-secondary" onClick={toggleShrink} />
                            </button>
                            :
                            <div className="basis-4 grow-0"></div>
                        }
                        <p className={`min-w-0 basis-full grow-0 break-words ${shrink ? "text-ellipsis whitespace-nowrap overflow-hidden" : ""}`}>{vars[key]}</p>
                    </div>
                </li>
            })}
        </ul>
    </div>
}