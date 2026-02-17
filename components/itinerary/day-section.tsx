import type { ItineraryItem } from "@/lib/db/schema";
import { TimeBlockSection } from "./time-block-section";

const TIME_BLOCKS = ["morning", "afternoon", "night"] as const;

function formatDayHeader(day: string, dayNumber: number) {
  const date = new Date(`${day}T00:00:00`);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Day ${dayNumber} — ${weekday}, ${formatted}`;
}

export function DaySection({
  day,
  dayNumber,
  items,
}: {
  day: string;
  dayNumber: number;
  items: ItineraryItem[];
}) {
  const itemsByTimeBlock = new Map<string, ItineraryItem[]>();
  for (const block of TIME_BLOCKS) {
    itemsByTimeBlock.set(block, []);
  }
  for (const item of items) {
    const existing = itemsByTimeBlock.get(item.timeBlock) ?? [];
    existing.push(item);
    itemsByTimeBlock.set(item.timeBlock, existing);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold md:text-lg">
        {formatDayHeader(day, dayNumber)}
      </h2>

      <div className="flex flex-col gap-4 pl-2 md:pl-4">
        {TIME_BLOCKS.map((block) => (
          <TimeBlockSection
            items={itemsByTimeBlock.get(block) ?? []}
            key={block}
            timeBlock={block}
          />
        ))}
      </div>
    </section>
  );
}
