import { useSelector } from "@xstate/react";

const tomlSelector = (state: any) => state.context.toml;

export const ObservationSrcTask = ({ taskNode }: any) => {
  const toml = useSelector(taskNode, tomlSelector);

  return (
    <>
      {
        toml.map((line: string) => <pre data-prefix=">" className="text-success">
          <code>{line}</code>
        </pre>)
      }
    </>
  );
};
