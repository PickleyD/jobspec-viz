import { createMachine } from "xstate";

export type XYCoords = {
  x: number;
  y: number;
};

export type TaskNodeOptions = {
  id: string;
  initialCoords: XYCoords;
};

type TaskNodeEvent = { type: "" };

interface TaskNodeContext {
  customName?: string;
  initialCoords: XYCoords;
}

const defaultContext: TaskNodeContext = {
  customName: undefined,
  initialCoords: { x: 0, y: 0 },
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