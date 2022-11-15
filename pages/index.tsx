import type { NextPage } from "next";
import Head from "next/head";
import { Flow } from "../modules/flow";
import { Configurator } from "../modules/configurator";
import { Codegen } from "../modules/codegen";
import { LayoutGroup } from "framer-motion";
import { useState, useContext } from "react";
import {
  BookOpenIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { Simulator } from "../modules/simulator";
import { GlobalStateContext } from "../context/GlobalStateContext"
import getUint256 from "../examples/getUint256.json"
import { useSelector } from "@xstate/react";

const reactFlowInstanceSelector = (state: any) => state.context.reactFlowInstance;

const Home: NextPage = () => {

  const [helpMsgDisplayed, setHelpMsgDisplayed] = useState<boolean>(true);

  const [newProjectHeroDisplayed, setNewProjectHeroDisplayed] = useState<boolean>(true);

  const handleNewEmptyProject = () => setNewProjectHeroDisplayed(false)

  const globalServices = useContext(GlobalStateContext);

  const reactFlowInstance = useSelector(
    globalServices.workspaceService,
    reactFlowInstanceSelector
  )

  const handleRehydrate = (json: any) => {
    globalServices.workspaceService.send("RESTORE_STATE", {
      savedContext: json,
    });
    setNewProjectHeroDisplayed(false)
    setTimeout(() => reactFlowInstance.fitView({
      duration: 500,
      padding: 1
    }), 100)
  }

  return (
    <div className="bg-primary h-screen w-screen">
      <Head>
        <title>Chainlink Job Spec Viz</title>
        <meta
          name="description"
          content="Visual Programming for Chainlink Job Specifications"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {newProjectHeroDisplayed &&
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
            <div className="z-20 flex flex-col items-start justify-center gap-6 p-8">
              <div className="flex flex-col items-start justify-center gap-8 py-4">
                <div className="relative h-20 w-[141px]">
                  <Image src="/linkit.svg" alt="linkit logo" layout="fill" />
                </div>
                <h2 className="text-gray-300 text-sm font-bold max-w-sm">Learn, create, and test your next Chainlink job spec — <span className="text-secondary">directly from your web browser</span></h2>
              </div>
              <div className="divider max-w-[400px]" />
              <div className="flex flex-col gap-2">
                <div className="">
                  <p className="text-gray-300 text-sm font-bold max-w-sm">Start a new empty project or pick from a handful of examples to give yourself a headstart</p>
                </div>
                <div className="z-20 flex items-center justify-center h-28">
                  <div className="btn btn-outline" onClick={handleNewEmptyProject}>New Empty Project</div>
                  <div className="divider divider-horizontal"></div>
                  <div className="btn btn-outline" onClick={() => handleRehydrate(getUint256)}>{`Get -> Uint256`}</div>
                  <div className="divider divider-horizontal"></div>
                  <div className="p-8">Something else</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      {/* 
      {helpMsgDisplayed && (
        <div className="invisible md:visible fixed grid items-center justify-center h-full w-full z-10 pointer-events-none">
          <div className="rounded rounded-tr-3xl bg-base-100 p-4 flex flex-col gap-4 relative pointer-events-auto shadow-widget">
            <label
              tabIndex={0}
              onClick={() => setHelpMsgDisplayed(false)}
              className={`pointer-events-auto absolute z-10 right-0 top-0 btn border-0 hover:border-2 hover:border-secondary btn-circle`}
            >
              <XMarkIcon className="swap-on fill-current h-5 w-5 text-white" />
            </label>
            <div className="flex items-center gap-2">
              <Image alt="logo" src="/logo.png" width={80} height={80} />
              <h1 className="font-bold underline text-xl">
                Chainlink Job Spec Viz
              </h1>
            </div>
            <div className="text-xs max-w-sm flex flex-col gap-2">
              <p>
                Drag, drop and connect tasks to visually program your Chainlink
                job spec. Copy the generated code to your Chainlink node and
                you&apos;re good to go!
              </p>
              <p>Here are the steps to follow:</p>
              <ul className="list-decimal pl-8">
                <li className="py-1">
                  Select your job type from the config panel (
                  <CogIcon className="inline fill-current h-3 w-3 text-white" />
                  ) in the top right.
                </li>
                <li className="py-1">
                  Drag some tasks from the palette panel (
                  <PlusIcon className="inline fill-current h-3 w-3 text-white" />
                  ) and drop them onto the workspace area.
                </li>
                <li className="py-1">
                  Connect the task nodes together and fill in any config fields.
                </li>
                <li className="py-1">
                  Your generated job spec (in TOML format) will be ready for you
                  in the code panel (
                  <CodeBracketIcon className="inline fill-current h-3 w-3 text-white" />
                  ). Any code highlighted in red here indicates missing or
                  invalid configuration.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )} */}

      <main className="w-full h-full relative">
        <div className="w-full h-full fixed z-0">
          <Flow />
        </div>
        <div className="visible md:invisible fixed grid items-center justify-center h-full w-full z-10 pointer-events-none">
          <div className="rounded bg-gray-700 p-4 flex flex-col gap-4 relative pointer-events-auto w-80">
            <div className="flex flex-col items-center gap-2">
              <Image alt="logo" src="/logo.png" width={40} height={40} />
              <h1 className="font-bold underline text-xl">
                Chainlink Job Spec Viz
              </h1>
            </div>
            <div className="text-xs max-w-sm flex flex-col gap-2">
              <p>
                Mobile support is not implemented. Please use the app on a
                larger device. Sorry!
              </p>
            </div>
          </div>
        </div>
        <div className="w-full h-full invisible md:visible fixed z-10 pointer-events-none">
          <div className="p-8 absolute left-0 flex flex-col items-end gap-2">
            {/* <label
                tabIndex={0}
                onClick={() => setHelpMsgDisplayed(true)}
                className={`pointer-events-auto btn border-0 hover:border-2 hover:border-secondary btn-circle`}
              >
                <QuestionMarkCircleIcon className="fill-current h-5 w-5 text-white" />
              </label> */}
            <a
              href="https://docs.chain.link/docs/jobs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <label
                tabIndex={0}
                className={`pointer-events-auto btn border-0 hover:border-2 hover:border-secondary btn-circle`}
              >
                <BookOpenIcon className="fill-current h-5 w-5 text-white" />
              </label>
            </a>
          </div>
          <div className="p-8 absolute right-0 flex flex-col items-end gap-4">
            <LayoutGroup>
              <Configurator className="pointer-events-none w-fit" />
              <Codegen className="pointer-events-none w-fit" />
              <Simulator className="pointer-events-none w-fit" />
            </LayoutGroup>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
