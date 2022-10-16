import { forwardRef } from "react"

export interface TaskChipProps extends React.HTMLAttributes<HTMLButtonElement> {
}

export const TaskChip = forwardRef<HTMLButtonElement, TaskChipProps>(({ children, ...rest }: TaskChipProps, ref) => {

    return <button ref={ref} {...rest} className="transition cursor-pointer border rounded border-gray-700 hover:border-secondary flex gap-1 items-center py-1 px-1 w-fit">
        <div className="uppercase text-xs font-bold px-1">
            {children}
        </div>
    </button>
})