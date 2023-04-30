import type { NextPage } from "next";
import Head from "next/head";
import { Flow, Codegen, Simulator, Configurator, UserProfilePanel, Examples, ImportModal } from "../modules"
import { useState, useContext } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { GlobalStateContext } from "../context/GlobalStateContext";
import empty from "../examples/empty.json";
import ethCall from "../examples/ethcall.json";
import getUint256 from "../examples/getUint256.json";
import median from "../examples/median.json";
import { useSelector } from "@xstate/react";
import { SideMenu, TopMenu } from "../components/menu";
import Split from "react-split"

const reactFlowInstanceSelector = (state: any) =>
  state.context.reactFlowInstance;

const openModalsSelector = (state: any) => state.context.openModals

const Home: NextPage = () => {
  const [helpMsgDisplayed, setHelpMsgDisplayed] = useState<boolean>(true);

  const [newProjectHeroDisplayed, setNewProjectHeroDisplayed] =
    useState<boolean>(true);

  const handleNewEmptyProject = () => setNewProjectHeroDisplayed(false);

  const globalServices = useContext(GlobalStateContext);

  const reactFlowInstance = useSelector(
    globalServices.workspaceService,
    reactFlowInstanceSelector
  );

  const openModals = useSelector(
    globalServices.workspaceService,
    openModalsSelector
  )

  const handleRehydrate = (json: any) => {
    globalServices.workspaceService.send("RESTORE_STATE", {
      savedContext: json,
    });
    setNewProjectHeroDisplayed(false);
    setTimeout(
      () =>
        reactFlowInstance.fitView({
          duration: 500,
          padding: 1,
        }),
      100
    );
  };

  const handleSave = () => {
    globalServices.workspaceService.send("SAVE_JOB_SPEC_VERSION");
  }

  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen)

  const [selectedSideMenuItem, setSelectedSideMenuItem] = useState(0)
  const handleSelectedSideMenuItemChange = (newIndex: number) => {
    setSelectedSideMenuItem(newIndex)
  }

  return (
    <div className="bg-primary h-screen w-screen relative">
      <Head>
        <title>LINKIT</title>
        <meta
          name="description"
          content="Visually Create and Test Your Next Chainlink Job Spec"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {openModals.length > 0 &&
        <div className="absolute z-50 inset-0 pointer-events-auto backdrop-blur-sm flex items-center justify-center p-8">
          {
            openModals.includes("import") && <ImportModal />
          }
        </div>
      }
      {newProjectHeroDisplayed && (
        <div className="absolute z-50 h-full w-full pointer-events-auto backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-base-100 relative shadow-widget h-full w-full max-w-[800px] max-h-[500px] rounded-lg flex flex-col items-start justify-start gap-8">
            <div className="absolute top-4 right-4 h-96 w-96 z-10">
              <div className="relative h-96 w-96">
                <Image src="/blob.svg" layout="fill" />
                <div className="absolute top-12 h-40 w-full">
                  <div className="relative h-full w-full">
                    <Image src="/illustration.svg" layout="fill" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 z-50">
              <label
                tabIndex={0}
                onClick={() => setNewProjectHeroDisplayed(false)}
                className={`pointer-events-auto btn border-0 hover:border-2 hover:border-secondary btn-circle`}
              >
                <XMarkIcon className="h-5 w-5" />
              </label>
            </div>
            <div className="z-20 flex flex-col items-start justify-center gap-6 p-8">
              <div className="flex flex-col items-start justify-center gap-8 py-4">
                <div className="relative h-20 w-[141px]">
                  <Image src="/linkit.svg" alt="linkit logo" layout="fill" />
                </div>
                <h2 className="text-gray-300 text-sm font-bold max-w-sm">
                  Learn, create, and test your next Chainlink job spec —{" "}
                  <span className="text-secondary">
                    directly from your web browser
                  </span>
                </h2>
              </div>
              <div className="divider max-w-[400px]" />
              <div className="flex flex-col gap-2">
                <div className="">
                  <p className="text-gray-300 text-sm font-bold max-w-sm">
                    Start from an empty project or pick an example to give
                    yourself a headstart
                  </p>
                </div>
                <div className="z-20 flex items-center justify-center h-28">
                  <div
                    className="btn btn-outline"
                    onClick={() => handleRehydrate(empty)}
                  >
                    Empty Project
                  </div>
                  <div className="divider divider-horizontal"></div>
                  <div
                    className="btn btn-outline"
                    onClick={() => handleRehydrate(ethCall)}
                  >{`ETH Call`}</div>
                  <div className="divider divider-horizontal"></div>
                  <div
                    className="btn btn-outline"
                    onClick={() => handleRehydrate(getUint256)}
                  >{`Get -> Uint256`}</div>
                  <div className="divider divider-horizontal"></div>
                  <div
                    className="btn btn-outline"
                    onClick={() => handleRehydrate(median)}
                  >{`Median Answer`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="w-full h-full relative">
        <div className="w-full h-full fixed z-0">
          <Flow />
        </div>
        <div className="visible md:invisible fixed grid items-center justify-center h-full w-full z-50 pointer-events-auto bg-primary">
          <div className="rounded-lg bg-base-100 p-8 flex flex-col gap-4 relative pointer-events-auto w-80">
            <div className="relative h-20 w-[141px]">
              <Image src="/linkit.svg" alt="linkit logo" layout="fill" />
            </div>
            <div className="text-xs max-w-sm flex flex-col gap-2">
              <p>
                Mobile support is not implemented. Please use the app on a
                larger device. Sorry!
              </p>
            </div>
          </div>
        </div>
        <div className="h-full w-screen p-4 flex flex-col">
          <TopMenu lit={isMenuOpen} onToggleClick={handleMenuToggle} />
          {isMenuOpen && <div className="grow relative flex h-px w-full pointer-events-none">
            <Split
              minSize={[200, 0]}
              sizes={[25, 75]}
              className="h-full w-full flex pointer-events-none" gutter={(index, direction) => {
                const gutter = document.createElement('div')
                gutter.className = `pointer-events-auto gutter gutter-${direction} bg-gray-700 rounded-r-lg
                cursor-resize bg-split-handle bg-no-repeat bg-center hover:bg-gray-500`
                return gutter
              }}>
              <div className="relative pointer-events-auto">
                <div className="grow relative flex h-full w-full">
                  <div className="absolute bg-base-200 inset-0 rounded-bl-lg" />
                  <div className="absolute bg-gradient-to-t from-base-100 via-base-200/20 to-transparent inset-0 rounded-bl-lg" />
                  <div className="absolute bg-gradient-to-b from-base-100 via-base-100/50 to-transparent inset-0 border border-gray-700 rounded-bl-lg" />
                  <div className="absolute bg-noise opacity-25 inset-0 rounded-bl-lg" />
                  <SideMenu selectedIndex={selectedSideMenuItem} onSelectedIndexChange={handleSelectedSideMenuItemChange} />
                  <div className="h-full overflow-auto relative">
                    <div className="w-max relative min-h-full">
                      <div className="p-4 relative h-full">
                        {
                          renderSideMenuContent(selectedSideMenuItem)
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none"></div>
            </Split>
          </div>}
        </div>
        {/* <div className="w-full h-full invisible md:visible fixed z-10 pointer-events-none">
          <div className="p-8 pt-10 absolute left-0 flex flex-col gap-4">
            <UserProfilePanel className="pointer-events-none w-fit" />
            <label
              tabIndex={0}
              onClick={() => setNewProjectHeroDisplayed(true)}
              className={`ml-2 mt-2 pointer-events-auto btn border-0 hover:border-2 hover:border-secondary btn-circle`}
            >
              <AcademicCapIcon className="h-5 w-5" />
            </label>
            <a
              href="https://docs.chain.link/docs/jobs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <label
                tabIndex={0}
                className={`ml-2 pointer-events-auto btn border-0 hover:border-2 hover:border-secondary btn-circle`}
              >
                <BookOpenIcon className="h-5 w-5" />
              </label>
            </a>
          </div> 
        </div> */}
      </main>
    </div>
  );
};

export default Home;

const renderSideMenuContent = (index: number) => {
  switch (index) {
    case 0:
      return <Examples />
    case 1:
      return <UserProfilePanel />
    case 2:
      return <Configurator />
    case 3:
      return <Codegen />
    default:
      return <Simulator />
  }
}
