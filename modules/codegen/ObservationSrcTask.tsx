import { useSelector } from "@xstate/react";

const tomlSelector = (state: any) => state.context.toml;
const isValidSelector = (state: any) => state.context.isValid;

export const ObservationSrcTask = ({ taskNode }: any) => {
  const toml = useSelector(taskNode, tomlSelector);
  const isValid = useSelector(taskNode, isValidSelector);

  return (
    <>
      {
        toml.map((line: string, index: number) => <pre key={index} data-prefix=">" className={`${isValid ? "text-success" : "text-error"}`}>
          <code>{line}</code>
        </pre>)
      }
    </>
  );
};
