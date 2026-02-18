import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PublicPollPage } from "@/components/poll";
import { getItineraryById, getPollById } from "@/lib/db/queries";

async function PollContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

function PollSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="h-12 animate-pulse rounded-lg bg-muted" />
      <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export default function PollPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PollSkeleton />}>
      <PollContent params={props.params} />
    </Suspense>
  );
}
