"use client";

import { memo } from "react";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { useItinerary } from "@/hooks/use-itinerary";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function formatHeaderDateRange(
  startDate: string | null,
  endDate: string | null
): string | null {
  if (!startDate) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const formatOpts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  const startStr = start.toLocaleDateString("en-US", formatOpts);

  if (!endDate) {
    return startStr;
  }

  const end = new Date(`${endDate}T00:00:00`);
  const endStr = end.toLocaleDateString("en-US", formatOpts);

  const nights = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return `${startStr} – ${endStr} (${nights} night${nights !== 1 ? "s" : ""})`;
}

function TripInfo({ chatId }: { chatId: string }) {
  const { itinerary } = useItinerary(chatId);

  const tripName = itinerary?.tripName || itinerary?.destination;
  const dateRange = formatHeaderDateRange(
    itinerary?.startDate ?? null,
    itinerary?.endDate ?? null
  );

  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <span className="truncate text-sm font-medium text-primary">
        {tripName || "New Trip"}
      </span>
      {dateRange && (
        <span className="truncate text-xs text-muted-foreground">
          {dateRange}
        </span>
      )}
    </div>
  );
}

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 pt-4 pb-1 md:px-2">
      <SidebarToggle />

      <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
        <TripInfo chatId={chatId} />
      </div>

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          className="ml-auto"
          selectedVisibilityType={selectedVisibilityType}
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
