import type { ItineraryItem } from "@/lib/db/schema";
import { AccommodationBanner } from "./accommodation-banner";
import { TimeBlockSection } from "./time-block-section";

const TIME_BLOCKS = ["morning", "evening"] as const;

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
  const accommodations: ItineraryItem[] = [];
  const rest: ItineraryItem[] = [];

  for (const item of items) {
    if (item.type === "accommodation") {
      accommodations.push(item);
    } else {
      rest.push(item);
    }
  }

  const itemsByTimeBlock = new Map<string, ItineraryItem[]>();
  for (const block of TIME_BLOCKS) {
    itemsByTimeBlock.set(block, []);
  }
  for (const item of rest) {
    const existing = itemsByTimeBlock.get(item.timeBlock) ?? [];
    existing.push(item);
    itemsByTimeBlock.set(item.timeBlock, existing);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold md:text-lg">
        {formatDayHeader(day, dayNumber)}
      </h2>

      {accommodations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {accommodations.map((item) => (
            <AccommodationBanner
              dayNumber={dayNumber}
              item={item}
              key={item.id}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 md:pl-4">
        {TIME_BLOCKS.map((block) => (
          <TimeBlockSection
            day={day}
            dayNumber={dayNumber}
            items={itemsByTimeBlock.get(block) ?? []}
            key={block}
            timeBlock={block}
          />
        ))}
      </div>
    </section>
  );
}
