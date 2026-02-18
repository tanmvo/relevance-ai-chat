"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolls } from "@/hooks/use-polls";
import type { PollWithOptionsAndCounts } from "@/lib/db/queries";
import { PollCard } from "./poll-card";
import { PollDetailSheet } from "./poll-detail-sheet";
import { PollsEmptyState } from "./polls-empty-state";

function PollsSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}

function sortPolls(polls: PollWithOptionsAndCounts[]): PollWithOptionsAndCounts[] {
  const active = polls
    .filter((p) => p.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const submitted = polls
    .filter((p) => p.status === "submitted")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return [...active, ...submitted];
}

export function PollsView({ chatId }: { chatId: string }) {
  const { polls, isLoading } = usePolls(chatId);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  if (isLoading) {
    return <PollsSkeleton />;
  }

  if (polls.length === 0) {
    return <PollsEmptyState />;
  }

  const sorted = sortPolls(polls);

  return (
    <>
      <div className="flex flex-col gap-3 p-4">
        {sorted.map((p) => (
          <PollCard key={p.id} onSelect={setSelectedPollId} poll={p} />
        ))}
      </div>

      <PollDetailSheet
        onClose={() => setSelectedPollId(null)}
        pollId={selectedPollId}
      />
    </>
  );
}
