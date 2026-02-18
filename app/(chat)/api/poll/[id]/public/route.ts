import type { NextRequest } from "next/server";
import { getPollById, getItineraryById } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pollData = await getPollById({ id });

    if (!pollData) {
      return new ChatSDKError("not_found:poll").toResponse();
    }

    const itineraryData = await getItineraryById({ id: pollData.itineraryId });

    return Response.json({
      poll: pollData,
      tripContext: itineraryData
        ? {
            tripName: itineraryData.tripName,
            destination: itineraryData.destination,
            startDate: itineraryData.startDate,
            endDate: itineraryData.endDate,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { code: "internal_error", message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
