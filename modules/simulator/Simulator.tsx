import { ExpanderPanel } from "../../components"
import { BeakerIcon } from "@heroicons/react/24/outline"

export interface SimulatorProps {
    className?: string;
  }

export const Simulator = ({ className = "" }: SimulatorProps) => <ExpanderPanel icon={BeakerIcon}>
    <div className="h-20 w-20">{/* onClick={handleToggleTestMode} */}</div>
</ExpanderPanel>