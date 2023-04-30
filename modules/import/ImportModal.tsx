import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";

export const ImportModal = () => {

    const globalServices = useContext(GlobalStateContext);

    const handleClickOutside = () => {
        globalServices.workspaceService.send("CLOSE_MODAL", { name: "import" })
    }

    return <div className="absolute inset-0 bg-transparent point-events-auto flex items-center justify-center" onClick={handleClickOutside}>
        <div className="h-40 w-80 bg-base-100">Import Modal</div>
    </div>
}