import React from "react";

export interface PowerTextFieldProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    incomingNodes: Array<string>;
}

export const PowerTextField = ({
    label,
    value,
    onChange,
    incomingNodes
}: PowerTextFieldProps) => {

    const handleIncomingNodeSelected = (incomingNode: string) => {
        onChange(`${value}$(${incomingNode})`)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value)
    }

    return <div className="form-control w-full max-w-xs">
        <label className="label pb-0">
            <span className="label-text">{label}</span>
        </label>
        <div className="flex items-center gap-1">
            <input
                value={value}
                onChange={handleChange}
                type="text"
                className="input input-bordered w-full max-w-xs"
            />
            <div className="dropdown">
                <label tabIndex={0} className=" m-1">
                    <button className="btn btn-circle btn-outline h-8 w-8 min-h-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </button>
                </label>
                <ul tabIndex={0} className="border dropdown-content menu p-2 shadow bg-base-100 rounded w-52">
                    {
                        incomingNodes && incomingNodes.length > 0 ?
                            incomingNodes.map((incomingNode: string) => <li className="text-xs"><a onClick={() => handleIncomingNodeSelected(incomingNode)}>{incomingNode}</a></li>)
                            :
                            <li className="text-xs">No incoming tasks connected</li>
                    }
                </ul>
            </div>
        </div>
    </div>
}