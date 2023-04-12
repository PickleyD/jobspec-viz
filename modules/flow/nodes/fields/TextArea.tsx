import React, { useState } from "react";
import { FieldLabel } from "../../../../components";

export interface TextAreaProps extends Omit<React.ComponentProps<"textarea">, "onChange"> {
    displayJsonValidity?: boolean;
    label?: string;
    value?: string;
    onChange?: (newValue: string) => void;
    onValidJsonChange?: (newJson: string) => void;
    placeholder?: string;
    optional?: boolean;
    className?: string;
}

export const TextArea = ({
    displayJsonValidity = false,
    label,
    value,
    onChange,
    onValidJsonChange = (_: string) => {},
    placeholder = "",
    optional = false,
    className = "",
    disabled,
    ...rest
}: TextAreaProps) => {

    const [isValidJson, setIsValidJson] = useState<boolean>(true)

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value
        const isValidJson = isJsonString(value)
        onChange && onChange(value)
        setIsValidJson(isValidJson)
        isValidJson && onValidJsonChange(JSON.stringify(JSON.parse(value)))
    }

    return <div className={`${className} form-control w-full`}>
        {label && <FieldLabel name={label} optional />}
        <textarea
            onChange={handleChange}
            placeholder={placeholder}
            value={value}
            className={`textarea textarea-bordered h-full ${displayJsonValidity ? getBorderClasses(isValidJson) : ""} ${disabled ? "text-gray-500" : ""}`}
            disabled={disabled}
            {...rest}
        />
    </div>
}

const getBorderClasses = (isValidJson: boolean) => isValidJson ? "border-success" : "border-error"

const isJsonString = (input: string) => {
    try {
        JSON.parse(input);
    } catch (e) {
        return false;
    }
    return true;
}