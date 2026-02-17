import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createItinerary,
  getChatById,
  getItineraryByChatId,
  getItineraryItemsByItineraryId,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const chatId = request.nextUrl.searchParams.get("chatId");

    if (!chatId) {
      return new ChatSDKError(
        "bad_request:api",
        "Missing required query parameter: chatId"
      ).toResponse();
    }

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const chat = await getChatById({ id: chatId });
    if (!chat || chat.userId !== session.user.id) {
      return new ChatSDKError("forbidden:chat").toResponse();
    }

    let itinerary = await getItineraryByChatId({ chatId });
    if (!itinerary) {
      await createItinerary({ chatId });
      itinerary = await getItineraryByChatId({ chatId });
    }
    if (!itinerary) {
      return new ChatSDKError(
        "not_found:database",
        "Itinerary not found"
      ).toResponse();
    }

    const items = await getItineraryItemsByItineraryId({
      itineraryId: itinerary.id,
    });

    return Response.json({ itinerary, items });
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
