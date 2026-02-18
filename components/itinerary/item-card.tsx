"use client";

import {
  BedDoubleIcon,
  BusIcon,
  CheckCircleIcon,
  MapPinIcon,
  UtensilsIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ItineraryItem } from "@/lib/db/schema";
import { EditItemButton } from "./itinerary-actions";

const TRANSPORT_NAME_REGEX = /^\[(\w+)]\s*(.*)$/;

const TYPE_CONFIG = {
  activity: {
    label: "Activity",
    icon: MapPinIcon,
  },
  accommodation: {
    label: "Stay",
    icon: BedDoubleIcon,
  },
  transport: {
    label: "Transport",
    icon: BusIcon,
  },
  meal: {
    label: "Meal",
    icon: UtensilsIcon,
  },
};

function parseTransportName(name: string): {
  subType: string | null;
  displayName: string;
} {
  const match = TRANSPORT_NAME_REGEX.exec(name);
  if (match) {
    return {
      subType: match[1].charAt(0).toUpperCase() + match[1].slice(1),
      displayName: match[2] || name,
    };
  }
  return { subType: null, displayName: name };
}

export function ItineraryItemCard({
  item,
  dayNumber,
}: {
  item: ItineraryItem;
  dayNumber: number;
}) {
  const [booked, setBooked] = useState(false);
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  const isTransport = item.type === "transport";
  const { subType, displayName } = isTransport
    ? parseTransportName(item.name)
    : { subType: null, displayName: item.name };

  const badgeLabel = subType ? `${config.label} — ${subType}` : config.label;
  const isFree = item.price
    ? /free/i.test(item.price)
    : false;
  const isBookable = Boolean(item.price) && !isFree;

  return (
    <Card className="group shadow-none transition-colors hover:bg-muted/30">
      <CardContent className="flex gap-3 p-3 md:p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold leading-tight md:text-base">
              {displayName}
            </span>
            <div className="flex items-center gap-1">
              {booked && (
                <Badge className="gap-1 border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-950">
                  <CheckCircleIcon className="size-3" />
                  Booked
                </Badge>
              )}
              <EditItemButton dayNumber={dayNumber} item={item} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {badgeLabel}
            {item.price && <span> &middot; {item.price}</span>}
          </p>

          {item.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">
              {item.description}
            </p>
          )}

          {isBookable && !booked && (
            <Button
              className="mt-1 h-7 w-fit gap-1.5 px-3 text-xs"
              onClick={() => setBooked(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              Book now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
