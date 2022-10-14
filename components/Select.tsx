import React from "react";
import { ChevronDownIcon } from "@heroicons/react/solid";

export const Select = ({
  value,
  onChange,
  children,
}: React.HTMLProps<HTMLSelectElement>) => {
  return (
    <div className="relative w-max">
      <select
        className="peer cursor-pointer absolute top-0 left-0 w-full h-full opacity-0"
        onChange={onChange}
        value={value}
      >
        {children}
      </select>
      <div className="peer-focus:shadow-blackonblack peer-hover:shadow-blackonblack bg-transparent text-xl font-bold uppercase p-2 pr-10 rounded-lg">
        {value}
      </div>
      <div className="
      transition
        opacity-0
      peer-hover:opacity-100
      peer-focus:opacity-100
      peer-focus:rotate-180
      absolute top-0 bottom-0 m-auto right-2 h-5 w-5 pointer-events-none">
        <ChevronDownIcon />
      </div>
    </div>
  );
};
