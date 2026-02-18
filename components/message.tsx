"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useMemo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import { ToolCallGroup, type ToolCallPart } from "./elements/tool-call-group";
import { SparklesIcon } from "./icons";
import { ViewItineraryButton } from "./itinerary/itinerary-actions";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PollCreationCard, PollSummaryCard } from "./poll";
import { PreviewAttachment } from "./preview-attachment";

const toolLabels: Record<string, string> = {
  "tool-updateTripMetadata": "Updating trip details",
  "tool-addActivity": "Adding activity",
  "tool-removeActivity": "Removing activity",
  "tool-setAccommodation": "Setting accommodation",
  "tool-setTransport": "Setting transport",
  "tool-webSearch": "Searching the web",
};

const ITINERARY_TOOL_TYPES = new Set([
  "tool-updateTripMetadata",
  "tool-addActivity",
  "tool-removeActivity",
  "tool-setAccommodation",
  "tool-setTransport",
]);

function getToolDisplayName(part: ToolCallPart): string {
  const label = toolLabels[part.type] ?? part.type.replace("tool-", "");
  const input = part.input as Record<string, unknown> | undefined;
  if (!input) {
    return label;
  }

  switch (part.type) {
    case "tool-addActivity":
    case "tool-removeActivity":
    case "tool-setAccommodation":
    case "tool-setTransport": {
      const name = input.name;
      if (typeof name === "string" && name.length > 0) {
        return `${label}: ${name}`;
      }
      return label;
    }
    case "tool-updateTripMetadata": {
      const fields = [
        "tripName",
        "destination",
        "startDate",
        "endDate",
        "adults",
        "children",
      ].filter((key) => input[key] !== undefined);
      if (fields.length > 0) {
        const keyToLabel: Record<string, string> = {
          tripName: "trip name",
          startDate: "start date",
          endDate: "end date",
        };
        const readable = fields.map((f) => keyToLabel[f] ?? f);
        return `${label}: ${readable.join(", ")}`;
      }
      return label;
    }
    case "tool-webSearch": {
      const query = input.query;
      if (typeof query === "string" && query.length > 0) {
        const truncated = query.length > 60 ? `${query.slice(0, 57)}…` : query;
        return `${label}: ${truncated}`;
      }
      return label;
    }
    default:
      return label;
  }
}

const PurePreviewMessage = ({
  addToolApprovalResponse,
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding: _requiresScrollPadding,
}: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  type MessagePart = NonNullable<typeof message.parts>[number];
  type GroupedItem =
    | { kind: "part"; part: MessagePart; index: number }
    | { kind: "tool-group"; parts: ToolCallPart[]; startIndex: number };

  const groupedParts = useMemo((): GroupedItem[] => {
    if (!message.parts) {
      return [];
    }

    const result: GroupedItem[] = [];
    let toolBuffer: ToolCallPart[] = [];
    let toolStartIndex = 0;

    const flushTools = () => {
      if (toolBuffer.length > 0) {
        result.push({
          kind: "tool-group",
          parts: toolBuffer,
          startIndex: toolStartIndex,
        });
        toolBuffer = [];
      }
    };

    const customToolTypes = new Set(["tool-createPoll"]);

    const rendersContent = (p: MessagePart): boolean => {
      if (p.type === "text") {
        return "text" in p && Boolean(String(p.text ?? "").trim());
      }
      if (p.type === "reasoning") {
        return "text" in p && Boolean(String(p.text ?? "").trim());
      }
      if (p.type === "file") {
        return true;
      }
      if (customToolTypes.has(p.type)) {
        return true;
      }
      return false;
    };

    message.parts.forEach((part, index) => {
      if (part.type.startsWith("tool-") && !customToolTypes.has(part.type)) {
        if (toolBuffer.length === 0) {
          toolStartIndex = index;
        }
        toolBuffer.push(part as unknown as ToolCallPart);
      } else {
        if (!rendersContent(part)) {
          return;
        }
        flushTools();
        result.push({ kind: "part", part, index });
      }
    });

    flushTools();
    return result;
  }, [message.parts]);

  const showViewItinerary = useMemo(
    () =>
      groupedParts.some(
        (g) =>
          g.kind === "tool-group" &&
          g.parts.some((p) => ITINERARY_TOOL_TYPES.has(p.type)) &&
          g.parts.every(
            (p) => p.state === "output-available" || p.state === "output-error"
          )
      ),
    [groupedParts]
  );

  return (
    <div
      className="group/message fade-in w-full animate-in duration-200"
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-3 md:gap-4", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-px flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "w-full":
              (message.role === "assistant" &&
                (message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                ) ||
                  message.parts?.some((p) => p.type.startsWith("tool-")))) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {groupedParts.map((group) => {
            if (group.kind === "tool-group") {
              return (
                <ToolCallGroup
                  getDisplayName={getToolDisplayName}
                  key={`tool-group-${group.startIndex}`}
                  parts={group.parts}
                />
              );
            }

            const { part, index } = group;
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning") {
              const hasContent = part.text?.trim().length > 0;
              const isStreaming = "state" in part && part.state === "streaming";
              if (hasContent || isStreaming) {
                return (
                  <MessageReasoning
                    isLoading={isLoading || isStreaming}
                    key={key}
                    reasoning={part.text || ""}
                  />
                );
              }
            }

            if (type === "text") {
              if (mode === "view") {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "wrap-break-word w-fit rounded-2xl px-3 py-2 text-left text-white":
                          message.role === "user",
                        "bg-transparent px-0 py-0 text-left":
                          message.role === "assistant",
                      })}
                      data-testid="message-content"
                      style={
                        message.role === "user"
                          ? { backgroundColor: "#006cff" }
                          : undefined
                      }
                    >
                      <Response>{sanitizeText(part.text)}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "tool-createPoll") {
              const toolPart = part as {
                type: string;
                toolCallId: string;
                state: string;
                input?: {
                  question: string;
                  options: Array<{ label: string; description?: string }>;
                };
                output?: {
                  success: boolean;
                  pollId?: string;
                  question?: string;
                  options?: Array<{
                    id: string;
                    label: string;
                    description: string | null;
                  }>;
                  shareUrl?: string;
                  error?: string;
                };
                approval?: { id: string; approved?: boolean; reason?: string };
                errorText?: string;
              };

              if (
                toolPart.state === "output-available" &&
                toolPart.output &&
                "pollId" in toolPart.output &&
                toolPart.output.pollId
              ) {
                return (
                  <div className="w-full" key={toolPart.toolCallId ?? key}>
                    <PollSummaryCard pollId={toolPart.output.pollId} />
                  </div>
                );
              }

              return (
                <div className="w-full" key={toolPart.toolCallId ?? key}>
                  <PollCreationCard
                    addToolApprovalResponse={addToolApprovalResponse}
                    approval={toolPart.approval}
                    input={toolPart.input}
                    output={
                      toolPart.output as Parameters<
                        typeof PollCreationCard
                      >[0]["output"]
                    }
                    state={toolPart.state}
                  />
                </div>
              );
            }
            return null;
          })}

          {showViewItinerary && <ViewItineraryButton />}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = PurePreviewMessage;

export const ThinkingMessage = () => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-px flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
            <span className="animate-pulse">Thinking</span>
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
