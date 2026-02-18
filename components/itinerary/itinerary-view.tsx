"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useItinerary } from "@/hooks/use-itinerary";
import { ItineraryEmptyState } from "./empty-state";
import { ItineraryContent } from "./itinerary-content";

function ItinerarySkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-6 w-48" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ItineraryView({ chatId }: { chatId: string }) {
  const { itinerary, items, isLoading } = useItinerary(chatId);

  if (isLoading) {
    return <ItinerarySkeleton />;
  }

  const hasMetadata =
    itinerary &&
    (itinerary.tripName ||
      itinerary.destination ||
      itinerary.startDate ||
      itinerary.adults);

  const hasItems = items.length > 0;

  if (!hasMetadata && !hasItems) {
    return <ItineraryEmptyState />;
  }

  if (!itinerary) {
    return <ItineraryEmptyState />;
  }

  return (
    <ItineraryContent chatId={chatId} items={items} itinerary={itinerary} />
  );
}
