import { PlusIcon, XIcon } from "@heroicons/react/solid"

export interface TaskChipProps {
    name: string;
}

export const TaskChip = ({ name }: TaskChipProps) => {

    return <div className="shadow border rounded border-gray-700 select-none flex gap-1 items-center py-1 cursor-move">
        <svg xmlns="http://www.w3.org/2000/svg" className="fill-current" height="18" viewBox="0 0 24 24" width="18"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
        <div className="uppercase text-sm text-bold">
            {name}
        </div>
    </div>
}