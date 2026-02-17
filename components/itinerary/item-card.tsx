import {
  BedDoubleIcon,
  BusIcon,
  MapPinIcon,
  UtensilsIcon,
} from "lucide-react";
import type { ItineraryItem } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const TRANSPORT_NAME_REGEX = /^\[(\w+)]\s*(.*)$/;

const TYPE_CONFIG = {
  activity: {
    label: "Activity",
    icon: MapPinIcon,
    variant: "secondary" as const,
  },
  accommodation: {
    label: "Accommodation",
    icon: BedDoubleIcon,
    variant: "secondary" as const,
  },
  transport: {
    label: "Transport",
    icon: BusIcon,
    variant: "secondary" as const,
  },
  meal: {
    label: "Meal",
    icon: UtensilsIcon,
    variant: "secondary" as const,
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

export function ItineraryItemCard({ item }: { item: ItineraryItem }) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  const isTransport = item.type === "transport";
  const { subType, displayName } = isTransport
    ? parseTransportName(item.name)
    : { subType: null, displayName: item.name };

  const badgeLabel = subType
    ? `${config.label} — ${subType}`
    : config.label;

  return (
    <Card className="shadow-none">
      <CardContent className="flex gap-3 p-3 md:p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted md:size-12">
          <Icon className="size-5 text-muted-foreground md:size-6" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold leading-tight md:text-base">
              {displayName}
            </span>
            {item.price && (
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                {item.price}
              </span>
            )}
          </div>

          <Badge className="w-fit text-xs" variant={config.variant}>
            {badgeLabel}
          </Badge>

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
