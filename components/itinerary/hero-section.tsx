import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { Card, CardContent } from "@/components/ui/card";
import type { Itinerary } from "@/lib/db/schema";

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

function formatGuestCount(adults: number | null, children: number | null) {
  const parts: string[] = [];

  if (adults && adults > 0) {
    parts.push(`${adults} adult${adults !== 1 ? "s" : ""}`);
  }
  if (children && children > 0) {
    parts.push(`${children} child${children !== 1 ? "ren" : ""}`);
  }

  return parts.length > 0 ? parts.join(", ") : null;
}

export function HeroSection({
  itinerary,
  chatId,
}: {
  itinerary: Itinerary;
  chatId?: string;
}) {
  const title = itinerary.tripName || itinerary.destination || "Untitled Trip";
  const dateRange = formatDateRange(itinerary.startDate, itinerary.endDate);
  const guestCount = formatGuestCount(itinerary.adults, itinerary.children);

  const hasAnyDetail = itinerary.destination || dateRange || guestCount;

  return (
    <Card className="border-none bg-gradient-to-br from-primary/5 to-primary/10 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
          {chatId && <ShareButton chatId={chatId} />}
        </div>

        {hasAnyDetail && (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {itinerary.destination && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-4 shrink-0" />
                <span>{itinerary.destination}</span>
              </div>
            )}
            {dateRange && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 shrink-0" />
                <span>{dateRange}</span>
              </div>
            )}
            {guestCount && (
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 shrink-0" />
                <span>{guestCount}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
