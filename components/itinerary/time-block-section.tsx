import { MoonIcon, SunIcon } from "lucide-react";
import type { ItineraryItem } from "@/lib/db/schema";
import { ItineraryItemCard } from "./item-card";

const TIME_BLOCK_CONFIG = {
  morning: {
    label: "Morning",
    icon: SunIcon,
  },
  evening: {
    label: "Evening",
    icon: MoonIcon,
  },
} as const;

export function TimeBlockSection({
  timeBlock,
  items,
}: {
  timeBlock: "morning" | "evening";
  items: ItineraryItem[];
}) {
  const config = TIME_BLOCK_CONFIG[timeBlock];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        <span>{config.label}</span>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ItineraryItemCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          No activities yet
        </div>
      )}
    </div>
  );
}
