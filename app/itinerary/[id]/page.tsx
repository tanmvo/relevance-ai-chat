import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItineraryContent } from "@/components/itinerary";
import {
  getItineraryById,
  getItineraryItemsByItineraryId,
} from "@/lib/db/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const itineraryData = await getItineraryById({ id });

  if (!itineraryData) {
    return { title: "Itinerary not found" };
  }

  const title = itineraryData.tripName || itineraryData.destination || "Trip Itinerary";
  const description = itineraryData.destination
    ? `Trip itinerary for ${itineraryData.destination}`
    : "View this trip itinerary";

  return { title, description };
}

export default async function PublicItineraryPage({ params }: Props) {
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
