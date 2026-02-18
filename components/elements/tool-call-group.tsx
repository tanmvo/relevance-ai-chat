"use client";

import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type ToolCallPart = {
  type: string;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const stepIcon: Record<string, ReactNode> = {
  "input-streaming": (
    <CircleIcon className="size-3 shrink-0 text-muted-foreground/50" />
  ),
  "input-available": (
    <ClockIcon className="size-3 shrink-0 animate-pulse text-foreground" />
  ),
  "output-available": (
    <CheckCircleIcon className="size-3 shrink-0 text-green-600" />
  ),
  "output-error": (
    <XCircleIcon className="size-3 shrink-0 text-red-600" />
  ),
};

type ToolCallGroupProps = {
  parts: ToolCallPart[];
  getDisplayName: (type: string) => string;
};

export function ToolCallGroup({ parts, getDisplayName }: ToolCallGroupProps) {
  const completedCount = parts.filter(
    (p) => p.state === "output-available"
  ).length;
  const errorCount = parts.filter(
    (p) => p.state === "output-error"
  ).length;
  const isAllDone = completedCount + errorCount === parts.length;

  let summaryText: string;
  if (isAllDone && errorCount === 0) {
    summaryText = `Completed ${parts.length} action${parts.length !== 1 ? "s" : ""}`;
  } else if (isAllDone) {
    summaryText = `Completed ${completedCount} of ${parts.length} (${errorCount} failed)`;
  } else {
    summaryText = `Running actions\u2026 (${completedCount} of ${parts.length})`;
  }

  return (
    <Collapsible
      className="group/tools not-prose w-full"
      defaultOpen={!isAllDone}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 py-1.5 text-sm transition-colors hover:text-foreground">
        {isAllDone ? (
          <CheckCircleIcon className="size-4 shrink-0 text-green-600" />
        ) : (
          <WrenchIcon className="size-4 shrink-0 animate-pulse text-muted-foreground" />
        )}
        <span className="flex-1 text-left font-medium text-muted-foreground">
          {summaryText}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tools:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
        <div className="ml-2 mt-1 space-y-0.5 border-l border-border pl-3">
          {parts.map((part, i) => (
            <div
              key={part.toolCallId ?? i}
              className="flex items-center gap-2 py-0.5 text-sm fade-in animate-in duration-150"
            >
              {stepIcon[part.state] ?? (
                <CircleIcon className="size-3 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={cn(
                  "truncate",
                  part.state === "output-error"
                    ? "text-red-600"
                    : "text-muted-foreground"
                )}
              >
                {getDisplayName(part.type)}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
