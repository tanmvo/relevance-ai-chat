"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useMemo } from "react";

type ChatActions = {
  sendMessage: (message: {
    role: "user";
    parts: { type: "text"; text: string }[];
  }) => void;
  setActiveTab: (tab: string) => void;
  setInput: Dispatch<SetStateAction<string>>;
};

const ChatActionsContext = createContext<ChatActions | null>(null);

export function ChatActionsProvider({
  children,
  sendMessage,
  setActiveTab,
  setInput,
}: ChatActions & { children: ReactNode }) {
  const value = useMemo(
    () => ({ sendMessage, setActiveTab, setInput }),
    [sendMessage, setActiveTab, setInput]
  );

  return (
    <ChatActionsContext.Provider value={value}>
      {children}
    </ChatActionsContext.Provider>
  );
}

export function useChatActions(): ChatActions | null {
  return useContext(ChatActionsContext);
}
