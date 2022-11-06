import React from "react";

export interface TextAreaProps extends Omit<React.ComponentProps<"textarea">, "onChange"> {
    label?: string;
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    optional?: boolean;
    className?: string;
}

export const TextArea = ({
    label,
    value,
    onChange,
    placeholder = "",
    optional = false,
    className = "",
    ...rest
}: TextAreaProps) => {

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value)
    }

    return <div className={`${className} form-control w-full max-w-xs`}>
        {label && <label className="label pb-0">
            <span className="label-text">{label}</span>
            {
                optional && <span className="label-text-alt">(optional)</span>
            }
        </label>
        }
        <textarea
            onChange={handleChange}
            placeholder={placeholder}
            value={value}
            className={`textarea textarea-bordered h-full`}
            {...rest}
        />
    </div>
}