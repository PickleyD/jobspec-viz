import React, { createContext } from "react";
import { useInterpret } from "@xstate/react";
import { workspaceMachine } from "../modules/workspace/workspaceMachine";

export interface GlobalStateContextState {
  workspaceService: any;
}

export const GlobalStateContext = createContext({} as GlobalStateContextState);

export interface GlobalStateContextProps {
  children?: React.ReactNode;
}

export const GlobalStateProvider = (props: GlobalStateContextProps) => {
  const workspaceService = useInterpret(workspaceMachine);

  return (
    <GlobalStateContext.Provider value={{ workspaceService }}>
      {props.children}
    </GlobalStateContext.Provider>
  );
};