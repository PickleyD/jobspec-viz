import type { NextPage } from "next";
import Head from "next/head";
import { Flow } from "../modules/flow";
import { Palette } from "../modules/palette";
import { Configurator } from "../modules/configurator";
import { Codegen } from "../modules/codegen";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { LayoutGroup } from "framer-motion";
import { useState } from "react";
import {
  XIcon,
  CogIcon,
  PlusIcon,
  CodeIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/solid";
import Image from "next/image";

const Home: NextPage = () => {
  const [helpMsgDisplayed, setHelpMsgDisplayed] = useState<boolean>(true);

  return (
    <div className="bg-base-100 h-screen w-screen">
      <Head>
        <title>Chainlink Job Spec Viz</title>
        <meta
          name="description"
          content="Visual Programming for Chainlink Job Specifications"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {helpMsgDisplayed && (
        <div className="fixed grid items-center justify-center h-full w-full z-10 pointer-events-none">
          <div className="rounded rounded-tr-3xl bg-gray-700 p-4 flex flex-col gap-4 relative pointer-events-auto">
            <label
              tabIndex={0}
              onClick={() => setHelpMsgDisplayed(false)}
              className={`pointer-events-auto absolute z-10 right-0 top-0 btn btn-circle`}
            >
              <XIcon className="swap-on fill-current h-5 w-5 text-blue-500" />
            </label>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" width={80} height={80} />
              <h1 className="font-bold underline text-xl">
                Chainlink Job Spec Viz
              </h1>
            </div>
            <div className="text-xs max-w-sm flex flex-col gap-2">
              <p>
                Drag, drop and connect tasks to visually program your Chainlink
                job spec. Copy the generated code to your Chainlink node and
                you're good to go!
              </p>
              <p>Here are the steps to follow:</p>
              <ul className="list-decimal pl-8">
                <li className="py-1">
                  Select your job type from the config panel (
                  <CogIcon className="inline fill-current h-3 w-3 text-blue-500" />
                  ) in the top right.
                </li>
                <li className="py-1">
                  Drag some tasks from the palette panel (
                  <PlusIcon className="inline fill-current h-3 w-3 text-blue-500" />
                  ) and drop them onto the workspace area.
                </li>
                <li className="py-1">
                  Connect the task nodes together and fill in any config fields.
                </li>
                <li className="py-1">
                  Your generated job spec (in TOML format) will be ready for you
                  in the code panel (
                  <CodeIcon className="inline fill-current h-3 w-3 text-blue-500" />
                  ). Any tasks highlighted in red here indicate some extra
                  configuration is required on the task node.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <DndProvider backend={HTML5Backend}>
        <main className="w-full h-full relative">
          <div className="w-full h-full fixed z-0">
            <Flow />
          </div>
          <div className="w-full h-full fixed z-10 pointer-events-none">
            <div className="p-8 absolute left-0 flex flex-col items-end gap-2">
              <label
                tabIndex={0}
                onClick={() => setHelpMsgDisplayed(true)}
                className={`pointer-events-auto btn btn-circle`}
              >
                <QuestionMarkCircleIcon className="fill-current h-5 w-5 text-blue-500" />
              </label>
            </div>
            <div className="p-8 absolute right-0 flex flex-col items-end gap-2">
              <LayoutGroup>
                <Configurator className="pointer-events-none w-fit" />
                <Palette className="pointer-events-none w-fit" />
                <Codegen className="pointer-events-none w-fit" />
              </LayoutGroup>
            </div>
          </div>
        </main>
      </DndProvider>
    </div>
  );
};

export default Home;
