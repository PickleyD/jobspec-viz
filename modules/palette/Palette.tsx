import { PlusIcon, XIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { TaskChip } from "./TaskChip";
import { DraggableItem } from "./DraggableItem";
import { motion } from "framer-motion";

export interface PaletteProps {
  className?: string;
}

export const Palette = ({ className }: PaletteProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={`${className} relative transition-all ${isOpen ? "" : ""}`}>
      <label
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto absolute z-10 right-0 top-0 btn btn-circle swap swap-rotate ${
          isOpen ? "swap-active" : ""
        }`}
      >
        <PlusIcon className="swap-off fill-current h-5 w-5 text-blue-500" />
        <XIcon className="swap-on fill-current h-5 w-5 text-blue-500" />
      </label>

      <motion.div
        className={`${isOpen ? "pointer-events-auto" : "pointer-events-none"}
        overflow-hidden relative z-0 bg-base-300 rounded rounded-tr-3xl`}
        layout="size"
        animate={{
          height: isOpen ? "auto" : "48px",
          opacity: isOpen ? 1 : 0,
        }}
        initial={false}
      >
        <div className="p-2">
          <div className="mr-16 text-left text-base uppercase underline underline-offset-4 py-1 w-fit font-bold tracking-widest">
            Tasks
          </div>
          <ul className="py-2 grid grid-rows-4 grid-flow-col gap-1">
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "HTTP",
                }}
              >
                <TaskChip name="HTTP" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "JSONPARSE",
                }}
              >
                <TaskChip name="JSON Parse" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "ETHTX",
                }}
              >
                <TaskChip name="ETH Tx" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "DIVIDE",
                }}
              >
                <TaskChip name="Divide" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "MULTIPLY",
                }}
              >
                <TaskChip name="Multiply" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "SUM",
                }}
              >
                <TaskChip name="Sum" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "ANY",
                }}
              >
                <TaskChip name="Any" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "MEDIAN",
                }}
              >
                <TaskChip name="Median" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "MODE",
                }}
              >
                <TaskChip name="Mode" />
              </DraggableItem>
            </li>
            <li>
              <DraggableItem
                itemProps={{
                  taskType: "MEAN",
                }}
              >
                <TaskChip name="Mean" />
              </DraggableItem>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};
