import { createMachine } from "xstate";

type TaskNodeEvent = { type: "" };

interface TaskNodeContext {
  customName?: string;
}

export const taskNodeMachine = createMachine<
  TaskNodeContext,
  TaskNodeEvent
>({
  id: "taskNode",
  initial: "idle",
  states: {
    idle: {},
  },
  context: {
    customName: undefined
  },
});