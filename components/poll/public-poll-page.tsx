"use client";

import {
  CalendarIcon,
  CheckCircle2Icon,
  ListChecksIcon,
  LockIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePoll } from "@/hooks/use-poll";
import { cn } from "@/lib/utils";

const BAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
];

type TripContext = {
  tripName: string | null;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
};

type PublicPollPageProps = {
  pollId: string;
  tripContext: TripContext | null;
};

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const formatOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const startStr = start.toLocaleDateString("en-US", formatOpts);

  if (!endDate) {
    return startStr;
  }

  const end = new Date(`${endDate}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  const endOpts: Intl.DateTimeFormatOptions = sameMonth
    ? { day: "numeric" }
    : { month: "short", day: "numeric" };
  const endStr = end.toLocaleDateString("en-US", endOpts);
  const year = end.getFullYear();

  if (sameYear) {
    return `${startStr} – ${endStr}, ${year}`;
  }

  return `${startStr}, ${start.getFullYear()} – ${endStr}, ${year}`;
}

function TripContextHeader({ tripContext }: { tripContext: TripContext }) {
  const title = tripContext.tripName ?? tripContext.destination ?? "Trip Poll";
  const dateRange = formatDateRange(
    tripContext.startDate,
    tripContext.endDate,
  );

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 px-4 py-3">
      <span className="text-sm font-semibold">{title}</span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {tripContext.destination && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="size-3.5" />
            {tripContext.destination}
          </span>
        )}
        {dateRange && (
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3.5" />
            {dateRange}
          </span>
        )}
      </div>
    </div>
  );
}

function OptionCard({
  label,
  description,
  index,
  selected,
  onSelect,
  disabled,
}: {
  label: string;
  description: string | null;
  index: number;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <button
      className={cn(
        "flex w-full gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        disabled && "pointer-events-none opacity-60",
      )}
      disabled={disabled}
      onClick={onSelect}
      type="button"
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {String.fromCharCode(65 + index)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </button>
  );
}

function ResultBar({
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
  const percentage =
    totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

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
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClass,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {voteCount} {voteCount === 1 ? "vote" : "votes"}
        </span>
        {voterNames.length > 0 && (
          <span className="truncate text-right">{voterNames.join(", ")}</span>
        )}
      </div>
    </div>
  );
}

function PollResults({
  poll,
}: {
  poll: NonNullable<ReturnType<typeof usePoll>["poll"]>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {poll.options.map((option, index) => (
          <ResultBar
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

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <UsersIcon className="size-3.5" />
        <span>
          {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"} total
        </span>
      </div>
    </div>
  );
}

export function PublicPollPage({ pollId, tripContext }: PublicPollPageProps) {
  const { poll, isLoading } = usePoll(pollId);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [voterName, setVoterName] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedOptionId || !voterName.trim()) {
      setError("Please enter your name and select an option.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/poll/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selectedOptionId,
          voterName: voterName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message ?? "Failed to submit vote. Please try again.");
        return;
      }

      setHasVoted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !poll) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const isClosed = poll.status === "submitted";
  const showResults = hasVoted || isClosed;

  return (
    <div className="flex flex-col gap-6 p-4 pb-8 md:p-6">
      {tripContext && <TripContextHeader tripContext={tripContext} />}

      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:size-12">
          <ListChecksIcon className="size-5 text-primary md:size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-base md:text-lg">
            {poll.question}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isClosed
              ? "This poll is closed"
              : "Select an option and submit your vote"}
          </p>
        </div>
      </div>

      {showResults ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 md:p-5">
            {hasVoted && !isClosed && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
                <CheckCircle2Icon className="size-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Thanks for voting, {voterName}!
                </span>
              </div>
            )}

            {isClosed && (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <LockIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  This poll has been closed — here are the final results
                </span>
              </div>
            )}

            <PollResults poll={poll} />
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {poll.options.map((option, index) => (
              <OptionCard
                description={option.description}
                disabled={isSubmitting}
                index={index}
                key={option.id}
                label={option.label}
                onSelect={() => {
                  setSelectedOptionId(option.id);
                  setError(null);
                }}
                selected={selectedOptionId === option.id}
              />
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              htmlFor="voter-name"
            >
              Your name
            </label>
            <Input
              disabled={isSubmitting}
              id="voter-name"
              onChange={(e) => {
                setVoterName(e.target.value);
                setError(null);
              }}
              placeholder="Enter your name"
              value={voterName}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            className="w-full"
            disabled={isSubmitting || !selectedOptionId || !voterName.trim()}
            onClick={handleSubmit}
            size="lg"
            type="button"
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </div>
      )}
    </div>
  );
}
