import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"

const contractAddressValueSelector = (state: any) => state.context.jobTypeSpecific.directRequest.contractAddress.value;
const minContractPaymentLinkJuelsSelector = (state: any) => state.context.jobTypeSpecific.directRequest.minContractPaymentLinkJuels.value;
const minIncomingConfirmationsSelector = (state: any) => state.context.jobTypeSpecific.directRequest.minIncomingConfirmations.value;

export interface DirectRequestFieldsProps {
  className?: string;
}

export const DirectRequestFields = ({ className = "" }: DirectRequestFieldsProps) => {

  const globalServices = useContext(GlobalStateContext);

  const contractAddress = useSelector(
    globalServices.workspaceService,
    contractAddressValueSelector
  )

  const minContractPaymentLinkJuels = useSelector(
    globalServices.workspaceService,
    minContractPaymentLinkJuelsSelector
  )

  const minIncomingConfirmations = useSelector(
    globalServices.workspaceService,
    minIncomingConfirmationsSelector
  )

  return <>
    <div className={`${className} form-control w-60`}>
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
    <div className={`${className} form-control w-60`}>
      <label className="label">
        <span className="label-text text-xs">Min. Contract Payment LINK</span>
        <span className="label-text text-xs">(optional)</span>
      </label>
      <input
        type="number"
        placeholder="Type amount in Juels"
        className="input input-bordered input-sm w-full max-w-lg"
        value={minContractPaymentLinkJuels}
        onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "directRequest", prop: "minContractPaymentLinkJuels", value: event.target.value }))}
      />
    </div>
    <div className={`${className} form-control w-60`}>
      <label className="label">
        <span className="label-text text-xs">Min. Incoming Confirmations</span>
        <span className="label-text text-xs">(optional)</span>
      </label>
      <input
        type="number"
        placeholder="Must be >= 1"
        className="input input-bordered input-sm w-full max-w-lg"
        value={minIncomingConfirmations}
        onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "directRequest", prop: "minIncomingConfirmations", value: event.target.value }))}
      />
    </div>
  </>
}