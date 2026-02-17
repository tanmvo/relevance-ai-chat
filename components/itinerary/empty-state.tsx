import { MapPinIcon } from "lucide-react";

export function ItineraryEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <MapPinIcon className="size-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold">No itinerary yet</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Start chatting to build your itinerary. The AI will help you plan your
          trip day by day.
        </p>
      </div>
    </div>
  );
}
