"use client";

import { BedDoubleIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ItineraryItem } from "@/lib/db/schema";
import { EditItemButton } from "./itinerary-actions";

export function AccommodationBanner({
  item,
  dayNumber,
}: {
  item: ItineraryItem;
  dayNumber: number;
}) {
  const [booked, setBooked] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <BedDoubleIcon className="size-4 text-muted-foreground" />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="min-w-0 truncate text-sm font-medium">
          {item.name}
        </span>

        {item.price && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {item.price}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {booked ? (
          <Badge className="gap-1 border-transparent bg-emerald-100 px-1.5 py-0.5 text-[11px] text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-950">
            <CheckCircleIcon className="size-3" />
            Booked
          </Badge>
        ) : item.price ? (
          <Button
            className="h-6 px-2 text-[11px]"
            onClick={() => setBooked(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            Book
          </Button>
        ) : null}

        <EditItemButton dayNumber={dayNumber} item={item} />
      </div>
    </div>
  );
}
