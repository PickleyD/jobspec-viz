import type { NextPage } from "next";
import Head from "next/head";
import { Flow, Codegen, Simulator, Configurator, UserProfilePanel, Examples, ImportModal, Chat } from "../modules"
import { useState, useContext } from "react";
import Image from "next/image";
import { GlobalStateContext } from "../context/GlobalStateContext";
import { useSelector } from "@xstate/react";
import { SideMenu, TopMenu } from "../components/menu";
import Split from "react-split"
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const reactFlowInstanceSelector = (state: any) =>
  state.context.reactFlowInstance;

const isIdleSelector = (state: any) => state.matches("idle")

const isAiWandModeSelector = (state: any) => state.matches("idle.aiWandMode")

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

  const isIdle = useSelector(
    globalServices.workspaceService,
    isIdleSelector
  )

  const isAiWandMode = useSelector(
    globalServices.workspaceService,
    isAiWandModeSelector
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

  const handleToggleAiWandMode = () => {
    globalServices.workspaceService.send("TOGGLE_AI_WAND")
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <div className="absolute bg-gradient-to-tl from-background to-muted min-h-[1200px] min-w-[1200px] h-full w-full" />
      <Head>
        <title>LINKIT</title>
        <meta
          name="description"
          content="Visually Create and Test Your Next Chainlink Job Spec"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ImportModal />
      <main className="w-full h-full relative">
        <div className="w-full h-full fixed z-0">
          <Flow />
        </div>
        <div className="visible md:invisible fixed grid items-center justify-center h-full w-full z-50 pointer-events-auto bg-background">
          <div className="rounded-lg bg-muted p-8 flex flex-col gap-4 relative pointer-events-auto w-80">
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
          <div className="w-full flex items-center justify-between">
            <TopMenu lit={isMenuOpen} onToggleClick={handleMenuToggle} />
            {isIdle && <div className="relative pointer-events-auto flex items-center space-x-2">
              <Switch id="ai-mode" checked={isAiWandMode} onCheckedChange={handleToggleAiWandMode} />
              <Label htmlFor="ai-mode">AI Assist</Label>
            </div>}
          </div>
          {isMenuOpen && <div className="grow relative flex h-px w-full pointer-events-none">
            <Split
              minSize={[200, 0]}
              sizes={[34, 66]}
              className="h-full w-full flex pointer-events-none" gutter={(index, direction) => {
                const gutter = document.createElement('div')
                gutter.innerHTML = `
                <div class="absolute inset-0 bg-split-handle bg-no-repeat bg-center cursor-resize"></div>
                <div class="absolute inset-0 bg-black opacity-0 hover:opacity-25"></div>
                `
                gutter.className = `overflow-hidden relative pointer-events-auto gutter gutter-${direction} bg-border dark:bg-gradient-copper rounded-r-lg`
                return gutter
              }}>
              <div className="relative pointer-events-auto">
                <div className="grow relative flex h-full w-full border dark:border-accent rounded-bl-lg">
                  <div className="rounded-bl-lg absolute bg-card inset-0 overflow-hidden">
                    <div className="w-screen h-screen absolute bg-gradient-to-t from-card via-muted/20 to-transparent" />
                    <div className="w-screen h-screen absolute bg-gradient-to-br from-card to-muted/50" />
                  </div>
                  <div className="absolute invert dark:invert-0 bg-noise opacity-20 inset-0" />
                  <SideMenu selectedIndex={selectedSideMenuItem} onSelectedIndexChange={handleSelectedSideMenuItemChange} />
                  <div className="h-full overflow-auto relative w-full">
                    <div className="min-w-max w-full relative min-h-full">
                      <div className="p-4 relative h-full w-full">
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
              <ForwardIcon className="h-5 w-5" />
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
    case 4:
      return <Simulator />
    default:
      return <Chat />
  }
}
