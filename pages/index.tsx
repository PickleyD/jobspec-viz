import type { NextPage } from "next";
import Head from "next/head";
import { Flow } from "../modules/flow";
import { Codegen } from "../modules/codegen";
import { UserProfilePanel } from "../modules/user-profile"
import { LayoutGroup } from "framer-motion";
import { useState, useContext } from "react";
import {
  AcademicCapIcon,
  BookOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Simulator } from "../modules/simulator";
import { GlobalStateContext } from "../context/GlobalStateContext";
import empty from "../examples/empty.json";
import ethCall from "../examples/ethcall.json";
import getUint256 from "../examples/getUint256.json";
import median from "../examples/median.json";
import { useSelector } from "@xstate/react";
import { SideMenu, TopMenu } from "../components/menu";
import Split from "react-split"
import { Configurator } from "../modules/configurator"

const reactFlowInstanceSelector = (state: any) =>
  state.context.reactFlowInstance;

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
    <div className="bg-primary h-screen w-screen">
      <Head>
        <title>LINKIT</title>
        <meta
          name="description"
          content="Visually Create and Test Your Next Chainlink Job Spec"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
          <TopMenu lit={isMenuOpen} />
          <div className="grow relative flex h-px w-full pointer-events-none">
            <SideMenu selectedIndex={selectedSideMenuItem} onSelectedIndexChange={handleSelectedSideMenuItemChange} />
            <Split
              minSize={[100, 0]}
              sizes={[25, 75]}
              className="h-full w-full flex pointer-events-none" gutter={(index, direction) => {
                const gutter = document.createElement('div')
                gutter.className = `pointer-events-auto gutter gutter-${direction} bg-gray-300/20 rounded-br-lg
                cursor-resize bg-split-handle bg-no-repeat bg-center hover:bg-gray-300/40`
                return gutter
              }}>
              <div className="h-full pointer-events-auto overflow-auto bg-base-100 relative border-b border-gray-700 shadow-lg">
                <div className="absolute bg-noise opacity-25 inset-0" />
                <div className="w-max relative bg-base-100 min-h-full">
                  <div className="absolute bg-noise opacity-25 inset-0" />
                  <div className="p-4 relative h-full">
                    {
                      renderSideMenuContent(selectedSideMenuItem)
                    }
                  </div>
                </div>
              </div>
              <div className="pointer-events-none"></div>
            </Split>
          </div>
        </div>
        <div className="w-full h-full invisible md:visible fixed z-10 pointer-events-none">
          {/* <div className="p-8 pt-10 absolute left-0 flex flex-col gap-4">
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
          </div> */}
          {/* <div className="p-8 absolute right-0 flex flex-col items-end gap-4">
            <LayoutGroup>
              <Configurator className="pointer-events-none w-fit" />
              <Codegen className="pointer-events-none w-fit" />
              <Simulator className="pointer-events-none w-fit" />
            </LayoutGroup>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Home;

const renderSideMenuContent = (index: number) => {
  switch (index) {
    case 0:
      return <Configurator />
    case 1:
      return <Codegen />
    default:
      return <Simulator />
  }
}
