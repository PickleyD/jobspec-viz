import { createMachine } from "xstate";

export type XYCoords = {
  x: number;
  y: number;
};

export type TaskNodeOptions = {
  id: string;
  initialCoords: XYCoords;
  taskType: TASK_TYPE;
};

type TaskNodeEvent = { type: "" };

export type TASK_TYPE = "SUM" | "DIVIDE" | "MEDIAN"

interface TaskNodeContext {
  customName?: string;
  initialCoords: XYCoords;
  taskType: TASK_TYPE;
}

const defaultContext: TaskNodeContext = {
  customName: undefined,
  initialCoords: { x: 0, y: 0 },
  taskType: "SUM"
};

export const createTaskNodeMachine = (
  initialContext: Partial<TaskNodeContext>
) => {
  const fullInitialContext = {
    ...defaultContext,
    ...initialContext,
  };

  return createMachine<TaskNodeContext, TaskNodeEvent>({
    id: "taskNode",
    context: fullInitialContext,
    initial: "idle",
    states: {
      idle: {},
    },
  });
};