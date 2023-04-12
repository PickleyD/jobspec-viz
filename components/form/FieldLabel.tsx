interface FieldLabelProps {
    name: string;
    optional?: boolean;
}

export const FieldLabel = ({
    name = "",
    optional = false
}: FieldLabelProps) => {
    return <label className="label">
        <span className="label-text text-xs whitespace-nowrap capitalize">{name}</span>
        { optional && <span className="label-text-alt text-[10px] text-gray-300 italic">optional</span> }
    </label>
}