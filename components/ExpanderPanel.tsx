import { CodeBracketIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { SVGProps, useState } from "react";

export interface ExpanderPanelProps {
  className?: string;
  icon?: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  children?: React.ReactNode;
  position?: "left" | "right"
}

export const ExpanderPanel = ({ className = "", children, icon: Icon = CodeBracketIcon, position = "right" }: ExpanderPanelProps) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const isLeft = position === "left"

  return (
    <div className={`${className} relative transition-all ${isOpen ? "" : ""}`}>
      <label
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={`${isLeft ? "left-2" : "right-2"} 
        pointer-events-auto absolute z-10 top-2 btn border-0 hover:border-2 hover:border-secondary btn-circle swap swap-rotate 
        ${isOpen ? "swap-active" : ""}`}
      >
        <Icon className="swap-off fill-current h-5 w-5 text-white" />
        <XMarkIcon className="swap-on fill-current h-5 w-5 text-white" />
      </label>

      <motion.div
        className={`${isLeft ? "pl-2 rounded-tl-[32px]" : "pr-2 rounded-tr-[32px]"}
        ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
         overflow-hidden border-2 border-gray-500 relative z-0 bg-background rounded-lg`}
        layout="size"
        animate={{
          height: isOpen ? "auto" : "48px",
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, type: "tween" }}
        initial={false}
      >
        {children}
      </motion.div>
    </div>
  );
};
