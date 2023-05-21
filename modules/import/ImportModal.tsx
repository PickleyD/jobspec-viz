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
        globalServices.workspaceService.send({ type: "CLOSE_MODAL", data: { name: "import" }})
    }

    const handleImport = () => {
        globalServices.workspaceService.send("IMPORT_SPEC", { content: importedSpec })
    }

    const [importedSpec, setImportedSpec] = useState<string>()

    const isButtonDisabled = !importedSpec || importedSpec?.length === 0

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
                    <Dialog.Overlay className="fixed inset-0 backdrop-blur" />
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
                    <div className="flex flex-col gap-4 max-w-md border border-gray-700 p-4 transition-all transform bg-background shadow-lg rounded-lg relative">
                        <div className="bg-noise invert dark:invert-0 opacity-20 absolute inset-0 rounded-lg pointer-events-none"/>
                        <Dialog.Title
                            as="h3"
                            className="uppercase text-sm font-bold tracking-wider text-muted-foreground"
                        >
                            Import Job Spec
                        </Dialog.Title>
                        <div className="flex flex-col bg-background">
                            <TextArea
                                textAreaClassName="h-96 w-full"
                                placeholder="Paste your job spec here"
                                value={importedSpec}
                                onChange={(newValue) => setImportedSpec(newValue)}
                            />
                        </div>

                        <p className="text-warning text-sm">Warning: Importing will overwrite any unsaved changes you may have.</p>

                        <div className="w-full flex justify-center align-items">
                            <button
                                className={`uppercase font-lg font-bold text-muted-foreground border-gray-700 border px-6 py-2 rounded-lg ${isButtonDisabled ? "" : "hover:border-white hover:text-white"}`}
                                onClick={handleImport}
                                disabled={isButtonDisabled}
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