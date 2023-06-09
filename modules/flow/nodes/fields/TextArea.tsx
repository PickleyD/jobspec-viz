import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { FieldLabel } from "@/components";

export interface TextAreaProps extends Omit<React.ComponentProps<"textarea">, "onChange"> {
    displayJsonValidity?: boolean;
    label?: string;
    value?: string;
    onChange?: (newValue: string) => void;
    onValidJsonChange?: (newJson: string) => void;
    placeholder?: string;
    optional?: boolean;
    className?: string;
    textAreaClassName?: string;
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
    textAreaClassName = "",
    disabled
}: TextAreaProps) => {

    const [isValidJson, setIsValidJson] = useState<boolean>(true)

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value
        const isValidJson = isJsonString(value)
        onChange && onChange(value)
        setIsValidJson(isValidJson)
        isValidJson && onValidJsonChange(JSON.stringify(JSON.parse(value)))
    }

    return <div className={`${className} flex flex-col w-full`}>
        {label && <FieldLabel name={label} optional />}
        <Textarea
            onChange={handleChange}
            placeholder={placeholder}
            value={value}
            className={`${textAreaClassName} ${displayJsonValidity ? getBorderClasses(isValidJson) : ""} ${disabled ? "text-muted-foreground" : ""}`}
            disabled={disabled}
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