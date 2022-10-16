import { TaskChip } from "./TaskChip"
import { TASK_TYPE } from "../../workspace/taskNodeMachine"

type Category = {
    name: string;
    tasks: Array<TASK_TYPE>;
}

const categories: Array<Category> = [
    {
        name: "Data & Interactivity",
        tasks: ["HTTP"]
    },
    {
        name: "Math",
        tasks: ["SUM", "MULTIPLY", "DIVIDE"]
    },
    {
        name: "Aggregators",
        tasks: ["MODE", "MEDIAN", "MEAN", "ANY"]
    }
]

export type TaskSelectorProps = {
    onTaskSelected: (task: TASK_TYPE) => void;
}

export const TaskSelector = ({ onTaskSelected }: TaskSelectorProps) => {

    return <div className="flex flex-col gap-4 p-4 w-60">
        {
            categories.map((category, catIndex) => <section key={`cat-${catIndex}`} className="flex flex-col align-start gap-2">
                <p className="whitespace-nowrap text-xs underline text-gray-400">{category.name}</p>
                <div className="flex flex-row flex-wrap gap-1">
                    {
                        category.tasks.map((task, taskIndex) => <TaskChip
                            onClick={() => onTaskSelected(task)}
                            key={`cat-${catIndex}-task-${taskIndex}`}>
                            {task}
                        </TaskChip>
                        )
                    }
                </div>
            </section>)
        }
    </div>
}