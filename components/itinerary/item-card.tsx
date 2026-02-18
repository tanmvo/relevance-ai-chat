import { BedDoubleIcon, BusIcon, MapPinIcon, UtensilsIcon } from "lucide-react";
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
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  const isTransport = item.type === "transport";
  const { subType, displayName } = isTransport
    ? parseTransportName(item.name)
    : { subType: null, displayName: item.name };

  const badgeLabel = subType ? `${config.label} — ${subType}` : config.label;

  return (
    <Card className="group shadow-none transition-colors hover:bg-muted/30">
      <CardContent className="flex gap-3 p-3 md:p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted md:size-12">
          <Icon className="size-5 text-muted-foreground md:size-6" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold leading-tight md:text-base">
              {displayName}
            </span>
            <EditItemButton dayNumber={dayNumber} item={item} />
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
        </div>
      </CardContent>
    </Card>
  );
}
