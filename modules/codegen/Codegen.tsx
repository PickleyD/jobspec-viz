import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useRef } from "react";
import { DocumentDuplicateIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { TomlLine } from "../workspace/workspaceMachine";
import { Tooltip } from "../../components";

export interface CodegenProps {
  className?: string;
}

const tomlSelector = (state: any) => state.context.toml;

export const Codegen = ({ className = "" }: CodegenProps) => {
  const globalServices = useContext(GlobalStateContext);
  const toml: Array<TomlLine> = useSelector(
    globalServices.workspaceService,
    tomlSelector
  )

  const codeRef = useRef<HTMLDivElement>(null);

  const [showCheckIcon, setShowCheckIcon] = useState<boolean>(false);

  const handleCopyToClipboard = () => {
    const selection = selectElementText(codeRef.current);

    // Deprecated command but does the job
    document.execCommand("copy");

    setShowCheckIcon(true);
    setTimeout(() => setShowCheckIcon(false), 1000);
  };

  const selectElementText = (el: any) => {
    let doc = window.document,
      sel,
      range;
    if (window.getSelection && doc.createRange) {
      sel = window.getSelection();
      range = doc.createRange();
      range.selectNodeContents(el);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    return sel;
  };

  return (
    <>
      <div className="flex items-center justify-start gap-2 mb-4">
        <h4 className="uppercase text-sm font-bold tracking-wider text-gray-400">Code</h4>
        <Tooltip className="text-sm text-gray-300">
          <p>Here is the generated TOML job spec. Copy and paste it into your Chainlink node UI when setting up your job!</p>
        </Tooltip>
      </div>
      <div
        className="mockup-code text-sm bg-base-100 relative"
        ref={codeRef}
      >
        <div className="absolute top-3.5 left-20 flex items-center gap-2">
          <label
            onClick={handleCopyToClipboard}
            tabIndex={0}
            className={`${showCheckIcon ? "swap-active" : ""
              } swap swap-rotate pointer-events-auto btn btn-circle h-6 w-6 min-h-0 border-gray-700 focus:border focus:border-secondary hover:border hover:border-secondary focus:border-secondary`}
          >
            <DocumentDuplicateIcon className="h-4 w-4 swap-off" />
            <CheckIcon className="h-4 w-4 swap-on" />
          </label>
        </div>
        <div className="max-h-96 max-w-3xl overflow-auto pr-6">
          {
            toml.map((line, index) => <pre key={index} data-prefix=">"
            // Disable red/green validity indication unless can think of a way to handle 'propagateResult' of false on inputs,
            // which is unknown without calling the graph endpoint
            // className={`${line.valid === undefined ? "" : (line.valid === true ? "text-success" : "text-error")}`}
            >
              <code>{line.value.replace(/\\/g, `\\\\`)}</code>
            </pre>)
          }
        </div>
      </div>
    </>
  );
};
