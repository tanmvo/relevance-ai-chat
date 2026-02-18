import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ItineraryContent } from "@/components/itinerary";
import {
  getItineraryById,
  getItineraryItemsByItineraryId,
} from "@/lib/db/queries";

async function ItineraryPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itineraryData = await getItineraryById({ id });

  if (!itineraryData) {
    notFound();
  }

  const items = await getItineraryItemsByItineraryId({
    itineraryId: itineraryData.id,
  });

  return <ItineraryContent itinerary={itineraryData} items={items} />;
}

function ItinerarySkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export default function PublicItineraryPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ItinerarySkeleton />}>
      <ItineraryPageContent params={props.params} />
    </Suspense>
  );
}
