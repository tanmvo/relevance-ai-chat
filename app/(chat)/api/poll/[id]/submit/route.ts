import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatById, getPollById, submitPoll } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:poll").toResponse();
    }

    const existingPoll = await getPollById({ id });

    if (!existingPoll) {
      return new ChatSDKError("not_found:poll").toResponse();
    }

    if (existingPoll.status === "submitted") {
      return new ChatSDKError(
        "bad_request:poll",
        "This poll has already been submitted"
      ).toResponse();
    }

    const chat = await getChatById({ id: existingPoll.chatId });
    if (!chat || chat.userId !== session.user.id) {
      return new ChatSDKError("forbidden:poll").toResponse();
    }

    const updated = await submitPoll({ id });

    return Response.json(updated);
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
