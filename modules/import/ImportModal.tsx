import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext } from "react";
import { TextArea } from "../flow/nodes/fields";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSelector } from "@xstate/react";

const openModalsSelector = (state: any) => state.context.openModals

export const ImportModal = () => {

    const globalServices = useContext(GlobalStateContext);

    const openModals = useSelector(
        globalServices.workspaceService,
        openModalsSelector
    )

    const handleClose = () => {
        globalServices.workspaceService.send("CLOSE_MODAL", { name: "import" })
    }

    const handleImport = () => {
        globalServices.workspaceService.send("IMPORT_SPEC", { content: importedSpec })
    }

    const [importedSpec, setImportedSpec] = useState<string>()

    return <Transition appear show={openModals.includes("import")} as={Fragment}>
        <Dialog
            as="div"
            className="fixed inset-0 overflow-y-auto"
            onClose={handleClose}
        >
            <div className="min-h-screen px-4 flex items-center justify-center">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm" />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div className="p-4 transition-all transform bg-base-100 shadow-xl rounded-lg">
                        <Dialog.Title
                            as="h3"
                            className="uppercase text-sm font-bold tracking-wider text-gray-400"
                        >
                            Import Job Spec
                        </Dialog.Title>
                        <div className="p-4 flex flex-col bg-base-100">
                            <TextArea
                                className="h-80 w-96"
                                placeholder="Paste your job spec here"
                                value={importedSpec}
                                onChange={(newValue) => setImportedSpec(newValue)}
                            />
                        </div>

                        <div className="w-full flex justify-center align-items">
                            <button
                                className="hover:underline"
                                onClick={handleImport}
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </Transition.Child>
            </div>
        </Dialog>
    </Transition>
}