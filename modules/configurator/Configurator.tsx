import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useState } from "react";
import { CogIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { CronFields, DirectRequestFields } from "./jobTypes"
import { JOB_TYPE } from "../workspace/workspaceMachine"

export interface ConfiguratorProps {
  className?: string;
}

const jobTypeSelector = (state: any) => state.context.type;
const nameSelector = (state: any) => state.context.name;
const externalJobIdSelector = (state: any) => state.context.externalJobId;

const renderJobTypeSpecificFields = (jobType: JOB_TYPE) => {
  switch (jobType) {
    case "cron":
      return <CronFields />
    case "directrequest":
      return <DirectRequestFields />
    default:
      return null
  }
}

export const Configurator = ({ className = "" }: ConfiguratorProps) => {
  const globalServices = useContext(GlobalStateContext);

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

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={`${className} relative transition-all ${isOpen ? "" : ""}`}>
      <label
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto absolute z-10 right-0 top-0 btn border-0 hover:border-2 hover:border-secondary btn-circle swap swap-rotate ${isOpen ? "swap-active" : ""
          }`}
      >
        <CogIcon className="swap-off fill-current h-5 w-5 text-white" />
        <XMarkIcon className="swap-on fill-current h-5 w-5 text-white" />
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
          <div className="flex gap-2">
            <div className="py-2">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">Job Type</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={jobType}
                  onChange={(event) => globalServices.workspaceService.send("SET_JOB_TYPE", { value: event.target.value })}
                >
                  <option value="cron">CRON</option>
                  <option value="directrequest">Direct Request</option>
                  <option value="fluxmonitor" disabled>Flux Monitor</option>
                  <option value="keeper" disabled>Keeper</option>
                  <option value="offchainreporting" disabled>Off-chain Reporting</option>
                  <option value="webhook" disabled>Webhook</option>
                </select>
              </div>

              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">Name</span>
                  <span className="label-text-alt text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered input-sm w-full max-w-xs"
                  value={name}
                  onChange={(event) => globalServices.workspaceService.send("SET_NAME", { value: event.target.value })}
                />
              </div>

              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text text-xs">External Job ID</span>
                  <span className="label-text-alt text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered input-sm w-full max-w-xs"
                  value={externalJobId}
                  onChange={(event) => globalServices.workspaceService.send("SET_EXTERNAL_JOB_ID", { value: event.target.value })}
                />
              </div>
            </div>
            <div className="py-2">
              {
                renderJobTypeSpecificFields(jobType)
              }
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
