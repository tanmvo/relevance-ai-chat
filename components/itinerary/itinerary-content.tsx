import type { Itinerary, ItineraryItem } from "@/lib/db/schema";
import { DaySection } from "./day-section";
import { HeroSection } from "./hero-section";

function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function groupItemsByDay(items: ItineraryItem[]): Map<string, ItineraryItem[]> {
  const grouped = new Map<string, ItineraryItem[]>();

  for (const item of items) {
    const existing = grouped.get(item.day) ?? [];
    existing.push(item);
    grouped.set(item.day, existing);
  }

  return grouped;
}

function getDayList(
  startDate: string | null,
  endDate: string | null,
  itemsByDay: Map<string, ItineraryItem[]>
): string[] {
  if (startDate && endDate) {
    return generateDateRange(startDate, endDate);
  }

  const days = [...itemsByDay.keys()].sort();
  return days;
}

export function ItineraryContent({
  itinerary,
  items,
}: {
  itinerary: Itinerary;
  items: ItineraryItem[];
}) {
  const hasMetadata =
    itinerary.tripName ||
    itinerary.destination ||
    itinerary.startDate ||
    itinerary.adults;

  const itemsByDay = groupItemsByDay(items);
  const days = getDayList(
    itinerary.startDate ?? null,
    itinerary.endDate ?? null,
    itemsByDay
  );

  return (
    <div className="flex flex-col gap-6 p-4 pb-8 md:p-6">
      {hasMetadata && <HeroSection itinerary={itinerary} />}

      {days.length > 0 ? (
        <div className="flex flex-col gap-8">
          {days.map((day, index) => (
            <DaySection
              day={day}
              dayNumber={index + 1}
              items={itemsByDay.get(day) ?? []}
              key={day}
            />
          ))}
        </div>
      ) : (
        hasMetadata && (
          <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No activities planned yet.
          </div>
        )
      )}
    </div>
  );
}
