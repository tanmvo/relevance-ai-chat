import type { NextRequest } from "next/server";
import { castVote, getPollById } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: { optionId: string; voterName: string } = await request.json();

    if (!body.optionId || !body.voterName?.trim()) {
      return new ChatSDKError(
        "bad_request:poll",
        "optionId and voterName are required"
      ).toResponse();
    }

    const pollData = await getPollById({ id });

    if (!pollData) {
      return new ChatSDKError("not_found:poll").toResponse();
    }

    if (pollData.status === "submitted") {
      return new ChatSDKError(
        "bad_request:poll",
        "This poll is closed and no longer accepting votes"
      ).toResponse();
    }

    const validOption = pollData.options.some(
      (opt) => opt.id === body.optionId
    );
    if (!validOption) {
      return new ChatSDKError(
        "bad_request:poll",
        "Invalid option ID for this poll"
      ).toResponse();
    }

    const created = await castVote({
      pollOptionId: body.optionId,
      voterName: body.voterName.trim(),
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
