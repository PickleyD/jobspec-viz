import { useSelector } from "@xstate/react";

const tomlSelector = (state: any) => state.context.toml;

export const ObservationSrcLine = ({ taskNode }: any) => {
  const toml = useSelector(taskNode, tomlSelector);

  return (
    <pre data-prefix=">" className="text-success">
      <code>{toml}</code>
    </pre>
  );
};
