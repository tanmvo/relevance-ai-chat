import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  getItineraryByChatId,
  createPoll as createPollInDb,
} from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type ToolDeps = {
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const createPoll = ({ chatId, dataStream }: ToolDeps) =>
  tool({
    description:
      "Create a poll to help the trip group decide between options (e.g., hotels, restaurants, activities). Pre-fill the question and 2-3 options from conversation context. The trip planner will review and confirm before the poll goes live.",
    inputSchema: z.object({
      question: z
        .string()
        .describe("The poll question, e.g. 'Which hotel should we book?'"),
      options: z
        .array(
          z.object({
            label: z
              .string()
              .describe(
                "Option label, e.g. 'Hotel Sakura' or 'Hiking at Mt. Takao'"
              ),
            description: z
              .string()
              .describe(
                "Optional context, e.g. '$180/night, 10 min from station'"
              )
              .optional(),
          })
        )
        .min(2)
        .max(3)
        .describe("2-3 options for the poll"),
    }),
    execute: async (input) => {
      const itinerary = await getItineraryByChatId({ chatId });
      if (!itinerary) {
        return {
          success: false as const,
          error: "No itinerary found for this chat. Please try again.",
        };
      }

      const createdPoll = await createPollInDb({
        chatId,
        itineraryId: itinerary.id,
        question: input.question,
        options: input.options.map((opt) => ({
          label: opt.label,
          description: opt.description,
        })),
      });

      dataStream.write({
        type: "data-poll-update",
        data: createdPoll.id,
      });

      return {
        success: true as const,
        pollId: createdPoll.id,
        question: createdPoll.question,
        options: createdPoll.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          description: opt.description,
        })),
        shareUrl: `/poll/${createdPoll.id}`,
      };
    },
  });
