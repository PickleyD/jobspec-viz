import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useRef } from "react";
import { DocumentDuplicateIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { TomlLine } from "../workspace/workspaceMachine";
import { Tooltip } from "../../components";
import { Button } from "@/components/ui/button";

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

  const handleImportClick = () => {
    globalServices.workspaceService.send("OPEN_MODAL", { name: "import" })
  }

  return (
    <>
      <div className="flex items-center justify-start gap-12 mb-4">
        <div className="flex items-center justify-start gap-2">
          <h4 className="uppercase text-sm font-bold tracking-wider text-gray-400">Code</h4>
          <Tooltip className="text-sm text-gray-300">
            <p>Here is the generated TOML job spec. Copy and paste it into your Chainlink node UI when setting up your job!</p>
          </Tooltip>
        </div>
        <button className="hover:underline text-gray-300 font-bold" onClick={handleImportClick}>Import</button>
      </div>
      <div
        className="p-4 mockup-code text-sm bg-black relative rounded-lg"
        ref={codeRef}
      >
        <div className="relative flex items-center justify-start gap-2 mb-4">
          <div className="p-2 flex gap-1">
            <div className={`grayscale-[70%] bg-[#ff6a6a] rounded-full h-3 w-3`} />
            <div className={`grayscale-[70%] bg-[#6ae1ff] rounded-full h-3 w-3`} />
            <div className={`grayscale-[70%] bg-[#ffe16a] rounded-full h-3 w-3`} />
          </div>
          <Button onClick={handleCopyToClipboard} variant="outline" className="w-6 h-6 rounded-full p-0">
            {showCheckIcon ? <CheckIcon className="h-4 w-4" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
            <span className="sr-only">Open task selector</span>
          </Button>
        </div>
        <div className="max-h-96 max-w-3xl overflow-auto px-4">
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
