import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"
import { FieldLabel } from "../../../components";
import { Input } from "@/components/ui/input";

const contractAddressValueSelector = (state: any) => state.context.jobTypeSpecific.directrequest.contractAddress.value;
const minContractPaymentLinkJuelsSelector = (state: any) => state.context.jobTypeSpecific.directrequest.minContractPaymentLinkJuels.value;
const minIncomingConfirmationsSelector = (state: any) => state.context.jobTypeSpecific.directrequest.minIncomingConfirmations.value;

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
    <div className={`${className} flex flex-col w-60`}>
      <FieldLabel name="Contract Address" />
      <Input
        type="text"
        placeholder=""
        className="w-full max-w-xs"
        value={contractAddress}
        onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "directrequest", prop: "contractAddress", value: event.target.value }))}
      />
    </div>
    <div className={`${className} flex flex-col w-60`}>
      <FieldLabel name="Min. Contract Payment LINK" optional />
      <Input
        type="number"
        placeholder="Type amount in Juels"
        className="w-full max-w-lg"
        value={minContractPaymentLinkJuels}
        onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "directrequest", prop: "minContractPaymentLinkJuels", value: event.target.value }))}
      />
    </div>
    <div className={`${className} flex flex-col w-60`}>
      <FieldLabel name="Min. Incoming Confirmations" optional />
      <Input
        type="number"
        placeholder="Must be >= 1"
        className="w-full max-w-lg"
        value={minIncomingConfirmations}
        onChange={(event) => (globalServices.workspaceService.send("SET_JOB_TYPE_SPECIFIC_PROPS", { jobType: "directrequest", prop: "minIncomingConfirmations", value: event.target.value }))}
      />
    </div>
  </>
}