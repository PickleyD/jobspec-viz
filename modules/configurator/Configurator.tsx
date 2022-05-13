import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { Edge } from "react-flow-renderer";
import { CogIcon, XIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { motion } from "framer-motion";

export interface ConfiguratorProps {
  className?: string;
}

const nodesSelector = (state: any) => state.context.nodes;
const edgesSelector = (state: any) => state.context.edges;

const incomingNodesSelector = (state: any) => state.context.incomingNodes;
const outgoingNodesSelector = (state: any) => state.context.outgoingNodes;

export const Configurator = ({ className = "" }: ConfiguratorProps) => {
  const globalServices = useContext(GlobalStateContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={`${className} relative transition-all ${isOpen ? "" : ""}`}>
      <label
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto absolute z-10 right-0 top-0 btn btn-circle swap swap-rotate ${isOpen ? "swap-active" : ""
          }`}
      >
        <CogIcon className="swap-off fill-current h-5 w-5 text-blue-500" />
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
        <div className="p-2">
          <div className="mr-16 text-left text-base uppercase underline underline-offset-4 py-1 w-fit font-bold tracking-widest">
            Config
          </div>
          <div className="h-60 w-60">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text text-xs">Job Type</span>
              </label>
              <select className="select select-bordered select-sm">
                <option>CRON</option>
                <option>Direct Request</option>
                <option disabled>Flux Monitor</option>
                <option disabled>Keeper</option>
                <option disabled>Off-chain Reporting</option>
                <option disabled>Webhook</option>
              </select>
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text text-xs">Name</span>
                <span className="label-text-alt text-xs">(optional)</span>
              </label>
              <input type="text" placeholder="Type here" className="input input-bordered input-sm w-full max-w-xs" />
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text text-xs">External Job ID</span>
                <span className="label-text-alt text-xs">(optional)</span>
              </label>
              <input type="text" placeholder="Type here" className="input input-bordered input-sm w-full max-w-xs" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
