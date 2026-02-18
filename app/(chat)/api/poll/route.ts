import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createPoll,
  getChatById,
  getItineraryByChatId,
  getPollsByChatId,
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
      return new ChatSDKError("unauthorized:poll").toResponse();
    }

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return Response.json([]);
    }
    if (chat.userId !== session.user.id) {
      return new ChatSDKError("forbidden:poll").toResponse();
    }

    const polls = await getPollsByChatId({ chatId });
    return Response.json(polls);
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:poll").toResponse();
    }

    const body: {
      chatId: string;
      question: string;
      options: Array<{ label: string; description?: string }>;
    } = await request.json();

    if (!body.chatId || !body.question || !body.options || body.options.length < 2) {
      return new ChatSDKError(
        "bad_request:poll",
        "chatId, question, and at least 2 options are required"
      ).toResponse();
    }

    if (body.options.length > 3) {
      return new ChatSDKError(
        "bad_request:poll",
        "A poll can have at most 3 options"
      ).toResponse();
    }

    const chat = await getChatById({ id: body.chatId });
    if (!chat || chat.userId !== session.user.id) {
      return new ChatSDKError("forbidden:poll").toResponse();
    }

    const itinerary = await getItineraryByChatId({ chatId: body.chatId });
    if (!itinerary) {
      return new ChatSDKError(
        "not_found:poll",
        "No itinerary found for this chat"
      ).toResponse();
    }

    const created = await createPoll({
      chatId: body.chatId,
      itineraryId: itinerary.id,
      question: body.question,
      options: body.options,
    });

    return Response.json(created, { status: 201 });
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
