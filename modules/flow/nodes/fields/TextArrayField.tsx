import React from "react";

export interface TextArrayFieldProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    onChangeAsArray?: (newArray: Array<string>) => void;
    placeholder?: string;
    optional?: boolean;
}

export const TextArrayField = ({
    label,
    value,
    onChange,
    onChangeAsArray,
    placeholder = "Enter each item on a new line",
    optional = false
}: TextArrayFieldProps) => {

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const asArray = event.target.value.split('\n')
        onChange(event.target.value.length > 0 ? `[${asArray.join(",")}]` : "")
        onChangeAsArray && onChangeAsArray(asArray)
    }

    return <div className="form-control w-full">
        <label className="label pb-0">
            <span className="label-text">{label}</span>
            {
                optional && <span className="label-text-alt">(optional)</span>
            }
        </label>
        <textarea
            onChange={handleChange}
            placeholder={placeholder}
            value={convertValueToNewlines(value)}
            className="whitespace-nowrap textarea textarea-bordered h-24 overflow-x-auto"
        />
    </div>
}

const convertValueToNewlines = (value: string) => {
    return value ? value.slice(1, -1).split(",").join("\n") : ""
}