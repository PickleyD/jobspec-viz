import { useSelector } from "@xstate/react";
import { GlobalStateContext } from "../../../context/GlobalStateContext";
import { useContext } from "react"

const contractAddressValueSelector = (state: any) => state.context.jobTypeSpecific.directRequest.contractAddress.value;
const contractAddressValiditySelector = (state: any) => state.context.jobTypeSpecific.directRequest.contractAddress.valid;

export const DirectRequestFields = () => {

    const globalServices = useContext(GlobalStateContext);

    const contractAddress = useSelector(
        globalServices.workspaceService,
        contractAddressValueSelector
    )

    const isValid = useSelector(
        globalServices.workspaceService,
        contractAddressValiditySelector
    )

    return <>
        <pre data-prefix=">" className={`${isValid ? "text-success" : "text-error"}`}>
            <code>{`contractAddress = "${contractAddress}"`}</code>
        </pre>
    </>
}