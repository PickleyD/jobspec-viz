import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useRef } from "react";
import { CodeBracketIcon } from "@heroicons/react/24/solid";
import { DocumentDuplicateIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { ExpanderPanel } from "../../components";
import { TomlLine } from "../workspace/workspaceMachine";

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
    <ExpanderPanel className={className} icon={CodeBracketIcon}>
        <div
          className="mockup-code text-sm bg-base-100 relative"
          ref={codeRef}
        >
          <label
            onClick={handleCopyToClipboard}
            tabIndex={0}
            className={`${
              showCheckIcon ? "swap-active" : ""
            } swap swap-rotate pointer-events-auto btn btn-circle btn-sm absolute top-2.5 left-20 hover:border hover:border-white`}
          >
            <DocumentDuplicateIcon className="h-5 w-5 swap-off" />
            <CheckIcon className="h-5 w-5 swap-on" />
          </label>
          <div className="max-h-96 max-w-3xl overflow-auto pr-6">
            {
              toml.map((line, index) => <pre key={index} data-prefix=">" 
              // Disable red/green validity indication unless can think of a way to handle 'propagateResult' of false on inputs,
              // which is unknown without calling the graph endpoint
              // className={`${line.valid === undefined ? "" : (line.valid === true ? "text-success" : "text-error")}`}
              >
              <code>{line.value}</code>
            </pre>)
            }
          </div>
        </div>
    </ExpanderPanel>
  );
};
