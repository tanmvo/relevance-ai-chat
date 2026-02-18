"use client";

import type { MouseEvent, KeyboardEvent } from "react";
import { UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PollWithOptionsAndCounts } from "@/lib/db/queries";
import { CopyLinkButton } from "./copy-link-button";

type PollCardProps = {
  poll: PollWithOptionsAndCounts;
  onSelect: (pollId: string) => void;
};

export function PollCard({ poll, onSelect }: PollCardProps) {
  const isSubmitted = poll.status === "submitted";

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    onSelect(poll.id);
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      const target = e.target as HTMLElement;
      if (target.closest("button")) {
        return;
      }
      e.preventDefault();
      onSelect(poll.id);
    }
  };

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50 active:bg-accent"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <CardContent className="flex flex-col gap-2.5 p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 min-w-0 flex-1 text-sm font-medium leading-snug">
            {poll.question}
          </p>
          {isSubmitted ? (
            <Badge className="shrink-0 bg-muted text-muted-foreground text-xs">
              Submitted
            </Badge>
          ) : (
            <Badge className="shrink-0 bg-green-500/10 text-green-700 text-xs">
              Active
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5" />
            <span>
              {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
            </span>
          </div>

          {!isSubmitted && (
            <CopyLinkButton pollId={poll.id} size="sm" variant="ghost" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
