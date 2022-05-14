import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { Edge } from "react-flow-renderer";
import { CodeIcon, XIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { motion } from "framer-motion";
import { ObservationSrcTask } from "./ObservationSrcTask";
// @ts-ignore
import toDot from "jgf-dot"

export interface CodegenProps {
  className?: string;
}

const nodesSelector = (state: any) => state.context.nodes;
const edgesSelector = (state: any) => state.context.edges;
const jobTypeSelector = (state: any) => state.context.type

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

  // Start nodes are any where the node only appears in an edge 'source' and not a 'target'
  // const getStartNodes = (edges: Array<Edge>) => {
  //   return edges.map(edge => edge.source).filter(edge => !edges.map(edge => edge.target).includes(edge))
  // }

  // const getEdgesWithSource = (sourceToFilter: string, edges: Array<Edge>) => {
  //   return edges.filter(edge => edge.source === sourceToFilter)
  // }

  // const getStartChains = (edges: Array<Edge>) => {
  //   const startNodes = getStartNodes(edges)

  //   const startChains = startNodes.map(startNode => {
  //     let chain = [startNode]
  //     let current = startNode

  //     const edgesWithSource = getEdgesWithSource(startNode, edges)

  //     console.log("edgesWithSource")
  //     console.log(edgesWithSource)
  //   })

  //   console.log("startChains")
  //   console.log(startChains)
  // }

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // const asDot = toDot({
  //   graph: {
  //     directed: true,
  //     nodes: nodesFromMachine.tasks ? nodesFromMachine.tasks.map((task: any) => ({ id: task.ref.id })) : [],
  //     edges: edgesFromMachine ? edgesFromMachine.map((edge: any) => ({ source: edge.source, target: edge.target })) : []
  //   }
  // })

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
        <div className="mockup-code text-sm bg-base-300">
          <pre data-prefix=">">
            <code>type = "{jobType}"</code>
          </pre>
          <pre data-prefix=">">
            <code>schemaVersion = 1</code>
          </pre>
          <pre data-prefix=">">
            <code>schedule = "CRON_TZ=UTC 0 0 1 1 *"</code>
          </pre>
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
