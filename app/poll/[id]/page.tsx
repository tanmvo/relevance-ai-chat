import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPollPage } from "@/components/poll";
import { getItineraryById, getPollById } from "@/lib/db/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pollData = await getPollById({ id });

  if (!pollData) {
    return { title: "Poll not found" };
  }

  return {
    title: pollData.question,
    description: "Vote on this trip poll and help plan the perfect getaway.",
  };
}

export default async function PollPage({ params }: Props) {
  const { id } = await params;
  const pollData = await getPollById({ id });

  if (!pollData) {
    notFound();
  }

  const itineraryData = await getItineraryById({ id: pollData.itineraryId });

  const tripContext = itineraryData
    ? {
        tripName: itineraryData.tripName,
        destination: itineraryData.destination,
        startDate: itineraryData.startDate,
        endDate: itineraryData.endDate,
      }
    : null;

  return <PublicPollPage pollId={pollData.id} tripContext={tripContext} />;
}
