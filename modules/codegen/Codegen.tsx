import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useRef } from "react";
import { CodeBracketIcon } from "@heroicons/react/24/solid";
import { DocumentDuplicateIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { ObservationSrcTask } from "./ObservationSrcTask";
import { CronFields, DirectRequestFields } from "./jobTypes";
import { ExpanderPanel } from "../../components";

export interface CodegenProps {
  className?: string;
}

const nodesSelector = (state: any) => state.context.nodes;
const edgesSelector = (state: any) => state.context.edges;
const jobTypeSelector = (state: any) => state.context.type;
const nameSelector = (state: any) => state.context.name;
const externalJobIdSelector = (state: any) => state.context.externalJobId;

export const Codegen = ({ className = "" }: CodegenProps) => {
  const globalServices = useContext(GlobalStateContext);
  const nodesFromMachine = useSelector(
    globalServices.workspaceService,
    nodesSelector
  );
  const edgesFromMachine = useSelector(
    globalServices.workspaceService,
    edgesSelector
  );
  const jobType = useSelector(globalServices.workspaceService, jobTypeSelector);
  const name = useSelector(globalServices.workspaceService, nameSelector);
  const externalJobId = useSelector(
    globalServices.workspaceService,
    externalJobIdSelector
  );

  const renderJobTypeSpecifics = () => {
    switch (jobType) {
      case "cron":
        return <CronFields />;
      case "directrequest":
        return <DirectRequestFields />;
      default:
        return <></>;
    }
  };

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
            <pre data-prefix=">">
              <code>type = "{jobType}"</code>
            </pre>
            <pre data-prefix=">">
              <code>schemaVersion = 1</code>
            </pre>
            {name && (
              <pre data-prefix=">">
                <code>name = "{name}"</code>
              </pre>
            )}
            {externalJobId && (
              <pre data-prefix=">">
                <code>externalJobId = "{externalJobId}"</code>
              </pre>
            )}
            {renderJobTypeSpecifics()}
            <pre data-prefix=">">
              <code>observationSource = """</code>
            </pre>
            {nodesFromMachine.tasks.map((taskNode: any, index: number) => (
              <ObservationSrcTask key={index} taskNode={taskNode.ref} />
            ))}
            <pre data-prefix=">">
              <code>"""</code>
            </pre>
            {edgesFromMachine.length > 0 && (
              <pre data-prefix=">">
                <code></code>
              </pre>
            )}
            {edgesFromMachine.map((edge: any, index: number) => (
              <pre key={index} data-prefix=">">
                <code>{`${edge.sourceCustomId} -> ${edge.targetCustomId}`}</code>
              </pre>
            ))}
          </div>
        </div>
    </ExpanderPanel>
  );
};
