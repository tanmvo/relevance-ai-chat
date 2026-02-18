"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

type ChatActions = {
  sendMessage: (message: {
    role: "user";
    parts: { type: "text"; text: string }[];
  }) => void;
  setActiveTab: (tab: string) => void;
};

const ChatActionsContext = createContext<ChatActions | null>(null);

export function ChatActionsProvider({
  children,
  sendMessage,
  setActiveTab,
}: ChatActions & { children: ReactNode }) {
  const value = useMemo(
    () => ({ sendMessage, setActiveTab }),
    [sendMessage, setActiveTab]
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
