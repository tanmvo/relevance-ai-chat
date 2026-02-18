"use client";

import { ArrowRightIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useCallback } from "react";
import { useChatActions } from "@/components/chat-actions-context";
import { Button } from "@/components/ui/button";
import type { ItineraryItem } from "@/lib/db/schema";

function formatDayLabel(day: string, dayNumber: number) {
  const date = new Date(`${day}T00:00:00`);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Day ${dayNumber} (${weekday}, ${formatted})`;
}

const TIME_BLOCK_LABELS: Record<string, string> = {
  morning: "Morning",
  evening: "Evening",
};

export function AddActivityButton({
  day,
  dayNumber,
  timeBlock,
}: {
  day: string;
  dayNumber: number;
  timeBlock: string;
}) {
  const chatActions = useChatActions();

  const handleClick = useCallback(() => {
    if (!chatActions) {
      return;
    }

    const dayLabel = formatDayLabel(day, dayNumber);
    const blockLabel = TIME_BLOCK_LABELS[timeBlock] ?? timeBlock;
    const prompt = `I'd like to add an activity to ${dayLabel} — ${blockLabel}`;

    chatActions.setInput(prompt);
    chatActions.setActiveTab("chat");
  }, [chatActions, day, dayNumber, timeBlock]);

  if (!chatActions) {
    return null;
  }

  return (
    <Button
      className="h-8 w-full gap-1.5 border-dashed text-xs text-muted-foreground"
      onClick={handleClick}
      type="button"
      variant="outline"
    >
      <PlusIcon className="size-3.5" />
      <span>Add</span>
    </Button>
  );
}

export function EditItemButton({
  item,
  dayNumber,
}: {
  item: ItineraryItem;
  dayNumber: number;
}) {
  const chatActions = useChatActions();

  const handleClick = useCallback(() => {
    if (!chatActions) {
      return;
    }

    const dayLabel = formatDayLabel(item.day, dayNumber);
    const blockLabel = TIME_BLOCK_LABELS[item.timeBlock] ?? item.timeBlock;
    const prompt = `I'd like to edit "${item.name}" on ${dayLabel} — ${blockLabel}`;

    chatActions.setInput(prompt);
    chatActions.setActiveTab("chat");
  }, [chatActions, item, dayNumber]);

  if (!chatActions) {
    return null;
  }

  return (
    <Button
      aria-label={`Edit ${item.name}`}
      className="size-6 shrink-0 text-muted-foreground [&_svg]:size-3.5"
      onClick={handleClick}
      size="icon"
      type="button"
      variant="ghost"
    >
      <PencilIcon className="size-3.5" />
    </Button>
  );
}

export function ViewItineraryButton() {
  const chatActions = useChatActions();

  const handleClick = useCallback(() => {
    if (!chatActions) {
      return;
    }
    chatActions.setActiveTab("itinerary");
  }, [chatActions]);

  if (!chatActions) {
    return null;
  }

  return (
    <Button
      className="mt-1 mb-0.5 h-7 w-fit gap-1.5 px-2.5 text-xs"
      onClick={handleClick}
      type="button"
      variant="outline"
    >
      <span>View in itinerary</span>
      <ArrowRightIcon className="size-3" />
    </Button>
  );
}
