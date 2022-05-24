import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"

const contractAddressValueSelector = (state: any) => state.context.jobTypeSpecific.directRequest.contractAddress.value;
const contractAddressValiditySelector = (state: any) => state.context.jobTypeSpecific.directRequest.contractAddress.valid;
const minContractPaymentLinkJuelsValueSelector = (state: any) => state.context.jobTypeSpecific.directRequest.minContractPaymentLinkJuels.value;
const minContractPaymentLinkJuelsValiditySelector = (state: any) => state.context.jobTypeSpecific.directRequest.minContractPaymentLinkJuels.valid;
const minIncomingConfirmationsValueSelector = (state: any) => state.context.jobTypeSpecific.directRequest.minIncomingConfirmations.value;
const minIncomingConfirmationsValiditySelector = (state: any) => state.context.jobTypeSpecific.directRequest.minIncomingConfirmations.valid;

export const DirectRequestFields = () => {

    const globalServices = useContext(GlobalStateContext);

    const contractAddress = useSelector(
        globalServices.workspaceService,
        contractAddressValueSelector
    )

    const isContractAddressValid = useSelector(
        globalServices.workspaceService,
        contractAddressValiditySelector
    )

    const minContractPaymentLinkJuels = useSelector(
        globalServices.workspaceService,
        minContractPaymentLinkJuelsValueSelector
    )

    const isMinContractPaymentLinkJuelsValid = useSelector(
        globalServices.workspaceService,
        minContractPaymentLinkJuelsValiditySelector
    )

    const minIncomingConfirmations = useSelector(
        globalServices.workspaceService,
        minIncomingConfirmationsValueSelector
    )

    const isMinIncomingConfirmationsValid = useSelector(
        globalServices.workspaceService,
        minIncomingConfirmationsValiditySelector
    )

    return <>
        <pre data-prefix=">" className={`${isContractAddressValid ? "text-success" : "text-error"}`}>
            <code>{`contractAddress = "${contractAddress}"`}</code>
        </pre>
        {
            minContractPaymentLinkJuels !== "" && <pre data-prefix=">" className={`${isMinContractPaymentLinkJuelsValid ? "text-success" : "text-error"}`}>
                <code>{`minContractPaymentLinkJuels = "${minContractPaymentLinkJuels}"`}</code>
            </pre>
        }
        {
            minIncomingConfirmations !== "" && <pre data-prefix=">" className={`${isMinIncomingConfirmationsValid ? "text-success" : "text-error"}`}>
                <code>{`minIncomingConfirmations = ${minIncomingConfirmations}`}</code>
            </pre>
        }
    </>
}