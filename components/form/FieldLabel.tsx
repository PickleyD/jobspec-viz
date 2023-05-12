import { Label } from "../ui/label";

interface FieldLabelProps extends React.ComponentProps<typeof Label> {
    name: string;
    optional?: boolean;
}

export const FieldLabel = ({
    name = "",
    optional = false,
    ...rest
}: FieldLabelProps) => {
    return <Label {...rest}>
        <div className="flex items-center justify-between mb-1 mt-3">
            <span>{name}</span>
            {optional && <span className="font-light italic text-[.8em]">optional</span>}
        </div>
    </Label>
}