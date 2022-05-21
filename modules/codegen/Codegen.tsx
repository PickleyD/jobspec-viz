import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { Edge } from "react-flow-renderer";
import { CodeIcon, XIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { motion } from "framer-motion";
import { ObservationSrcTask } from "./ObservationSrcTask";
import { CronFields } from "./jobTypes/CronFields";

export interface CodegenProps {
  className?: string;
}

const nodesSelector = (state: any) => state.context.nodes;
const edgesSelector = (state: any) => state.context.edges;
const jobTypeSelector = (state: any) => state.context.type
const nameSelector = (state: any) => state.context.name
const externalJobIdSelector = (state: any) => state.context.externalJobId

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
  const jobType = useSelector(
    globalServices.workspaceService,
    jobTypeSelector
  )
  const name = useSelector(
    globalServices.workspaceService,
    nameSelector
  )
  const externalJobId = useSelector(
    globalServices.workspaceService,
    externalJobIdSelector
  )

  const tasks = [
    ...Array.from(
      new Set([
        ...edgesFromMachine
          .map((edge: Edge) => edge.source)
          .filter(
            (value: string, index: number, self: Array<string>) =>
              self.indexOf(value) === index
          ),
        ...edgesFromMachine
          .map((edge: Edge) => edge.target)
          .filter(
            (value: string, index: number, self: Array<string>) =>
              self.indexOf(value) === index
          ),
      ])
    ),
  ];

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const renderJobTypeSpecifics = () => {
    switch (jobType) {
      case "cron":
        return <CronFields />
      default:
        return <></>
    }
  }

  return (
    <div className={`${className} relative transition-all ${isOpen ? "" : ""}`}>
      <label
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto absolute z-10 right-0 top-0 btn btn-circle swap swap-rotate ${isOpen ? "swap-active" : ""
          }`}
      >
        <CodeIcon className="swap-off fill-current h-5 w-5 text-blue-500" />
        <XIcon className="swap-on fill-current h-5 w-5 text-blue-500" />
      </label>

      <motion.div
        className={`${isOpen ? "pointer-events-auto" : "pointer-events-none"
          } overflow-hidden relative z-0 bg-base-300 rounded rounded-tr-3xl`}
        layout="size"
        animate={{
          height: isOpen ? "auto" : "48px",
          opacity: isOpen ? 1 : 0,
        }}
        initial={false}
      >
        <div className="mockup-code text-xs bg-base-300">
          <pre data-prefix=">">
            <code>type = "{jobType}"</code>
          </pre>
          <pre data-prefix=">">
            <code>schemaVersion = 1</code>
          </pre>
          {name && <pre data-prefix=">">
            <code>name = {name}</code>
          </pre>}
          {externalJobId && <pre data-prefix=">">
            <code>externalJobId = {externalJobId}</code>
          </pre>}
          {
            renderJobTypeSpecifics()
          }
          <pre data-prefix=">">
            <code>observationSource = """</code>
          </pre>
          {nodesFromMachine.tasks.map((taskNode: any, index: number) => (
            <ObservationSrcTask key={index} taskNode={taskNode.ref} />
          ))}
          <pre data-prefix=">">
            <code>"""</code>
          </pre>
          {
            edgesFromMachine.length > 0 && <pre data-prefix=">">
              <code></code>
            </pre>
          }
          {
            edgesFromMachine.map((edge: any, index: number) => <pre key={index} data-prefix=">">
              <code>{`${edge.source} -> ${edge.target}`}</code>
            </pre>)
          }
        </div>
      </motion.div>
    </div>
  );
};
