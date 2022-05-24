import cronstrue from "cronstrue"
import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useState, useEffect, useContext } from "react"

const contractAddressValueSelector = (state: any) => state.context.jobTypeSpecific.directRequest.contractAddress.value;

export interface WebhokFieldsProps {
  className?: string;
}

export const DirectRequestFields = ({ className = "" }) => {

  const globalServices = useContext(GlobalStateContext);

  const contractAddress = useSelector(
    globalServices.workspaceService,
    contractAddressValueSelector
  )

  return <div className={`${className} form-control w-full max-w-xs`}>
    <label className="label">
      <span className="label-text text-xs">Contract Address</span>
    </label>
    <input
      type="text"
      placeholder="Type here"
      className="input input-bordered input-sm w-full max-w-xs"
      value={contractAddress}
      onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "directRequest", prop: "contractAddress", value: event.target.value }))}
    />
  </div>
}