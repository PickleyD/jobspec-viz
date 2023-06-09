import { forwardRef } from "react"

export interface VarChipProps extends React.ComponentProps<"button"> {
}

export const VarChip = forwardRef<HTMLButtonElement, VarChipProps>(({ children, ...rest }: VarChipProps, ref) => {

    return <button ref={ref} {...rest} className="transition cursor-pointer border rounded border-gray-700 hover:border-secondary flex gap-1 items-center py-1 px-1 w-fit disabled:pointer-events-none disabled:text-muted-foreground">
        <div className="text-xs font-bold px-1">
            {children}
        </div>
    </button>
})