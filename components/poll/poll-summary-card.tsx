"use client";

import { useState } from "react";
import {
  BarChart3Icon,
  SendIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePoll } from "@/hooks/use-poll";
import type { PollWithFullVotes } from "@/lib/db/queries";
import { cn } from "@/lib/utils";
import { useChatActions } from "../chat-actions-context";
import { toast } from "../toast";
import { CopyLinkButton } from "./copy-link-button";

const BAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
];

type PollSummaryCardProps = {
  pollId: string;
};

function OptionBar({
  label,
  description,
  voteCount,
  totalVotes,
  voterNames,
  colorClass,
}: {
  label: string;
  description: string | null;
  voteCount: number;
  totalVotes: number;
  voterNames: string[];
  colorClass: string;
}) {
  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {percentage}%
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {voteCount} {voteCount === 1 ? "vote" : "votes"}
        </span>
        {voterNames.length > 0 && (
          <span className="truncate text-right">
            {voterNames.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

function formatPollResultsMessage(poll: PollWithFullVotes, userMessage: string): string {
  const lines: string[] = [
    `Poll Results: ${poll.question}`,
    "",
  ];

  for (const option of poll.options) {
    const percentage = poll.totalVotes > 0
      ? Math.round((option.voteCount / poll.totalVotes) * 100)
      : 0;
    const voters = option.votes.map((v) => v.voterName);
    const voterStr = voters.length > 0 ? ` - ${voters.join(", ")}` : "";
    lines.push(
      `- ${option.label}: ${option.voteCount} ${option.voteCount === 1 ? "vote" : "votes"} (${percentage}%)${voterStr}`
    );
  }

  lines.push("", `Total: ${poll.totalVotes} ${poll.totalVotes === 1 ? "vote" : "votes"}`);

  const trimmed = userMessage.trim();
  if (trimmed) {
    lines.push("", trimmed);
  }

  return lines.join("\n");
}

export function PollSummaryCard({ pollId }: PollSummaryCardProps) {
  const { poll, isLoading, mutate } = usePoll(pollId);
  const chatActions = useChatActions();

  const [showSubmitPanel, setShowSubmitPanel] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col gap-3 p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return null;
  }

  const isSubmitted = poll.status === "submitted";

  const handleSubmit = async () => {
    if (!chatActions) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/poll/${pollId}/submit`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const body: { message?: string } = await response.json();
        throw new Error(body.message ?? "Failed to submit poll");
      }

      const message = formatPollResultsMessage(poll, userMessage);

      chatActions.sendMessage({
        role: "user",
        parts: [{ type: "text", text: message }],
      });

      chatActions.setActiveTab("chat");

      await mutate();

      setShowSubmitPanel(false);
      setUserMessage("");
    } catch (error) {
      toast({
        type: "error",
        description: error instanceof Error ? error.message : "Failed to submit poll results",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full", isSubmitted && "opacity-80")}>
      <CardContent className="flex flex-col gap-4 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted md:size-12">
            <BarChart3Icon className="size-5 text-muted-foreground md:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold md:text-base">
                Poll Results
              </h3>
              {isSubmitted ? (
                <Badge className="bg-muted text-muted-foreground text-xs">
                  Submitted
                </Badge>
              ) : (
                <Badge className="bg-green-500/10 text-green-700 text-xs">
                  Active
                </Badge>
              )}
            </div>
            <p className="mt-0.5 font-medium text-sm md:text-base">
              {poll.question}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {poll.options.map((option, index) => (
            <OptionBar
              colorClass={BAR_COLORS[index % BAR_COLORS.length]}
              description={option.description}
              key={option.id}
              label={option.label}
              totalVotes={poll.totalVotes}
              voteCount={option.voteCount}
              voterNames={option.votes.map((v) => v.voterName)}
            />
          ))}
        </div>

        {showSubmitPanel && !isSubmitted && (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
            <Textarea
              className="min-h-[60px] resize-none bg-background text-sm"
              disabled={isSubmitting}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Add context for the agent, e.g. 'Add this to Day 3 evening'"
              value={userMessage}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  setShowSubmitPanel(false);
                  setUserMessage("");
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                <XIcon className="mr-1 size-3.5" />
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleSubmit}
                size="sm"
                type="button"
              >
                <SendIcon className="mr-1 size-3.5" />
                {isSubmitting ? "Submitting..." : "Submit Results"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5" />
            <span>
              {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"} total
            </span>
          </div>

          {!isSubmitted && (
            <div className="flex items-center gap-2">
              <CopyLinkButton pollId={pollId} />
              {chatActions && !showSubmitPanel && (
                <Button
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  onClick={() => setShowSubmitPanel(true)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <SendIcon className="size-3" />
                  Submit to Agent
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
