import { TaskChip } from "./TaskChip"
import { TASK_TYPE } from "../../workspace/taskNodeMachine"

type Category = {
    name: string;
    tasks: Array<TASK_TYPE>;
}

const categories: Array<Category> = [
    {
        name: "Data & Interactivity",
        tasks: ["HTTP", "BRIDGE", "ETHTX", "ETHCALL"]
    },
    {
        name: "Encoding & Decoding",
        tasks: ["ETHABIENCODE", "ETHABIDECODE", "ETHABIDECODELOG"]
    },
    {
        name: "Parsing",
        tasks: ["JSONPARSE", "CBORPARSE", "LOOKUP"]
    },
    {
        name: "Math",
        tasks: ["SUM", "MULTIPLY", "DIVIDE", "LENGTH", "LESSTHAN"]
    },
    {
        name: "Aggregators",
        tasks: ["MODE", "MEDIAN", "MEAN", "ANY"]
    }
]

export type TaskSelectorProps = {
    onTaskSelected: (task: TASK_TYPE) => void;
    value: TASK_TYPE;
}

export const TaskSelector = ({ onTaskSelected, value }: TaskSelectorProps) => {

    return <div className="flex flex-col gap-4 w-60 rounded-lg">
        {
            categories.map((category, catIndex) => <section key={`cat_${catIndex}`} className="flex flex-col align-start gap-2">
                <p className="whitespace-nowrap text-xs underline text-muted-foreground">{category.name}</p>
                <div className="flex flex-row flex-wrap gap-1">
                    {
                        category.tasks.map((task, taskIndex) => <TaskChip
                            disabled={task === value}
                            onClick={() => onTaskSelected(task)}
                            key={`cat_${catIndex}_task_${taskIndex}`}>
                            {task}
                        </TaskChip>)
                    }
                </div>
            </section>)
        }
    </div>
}