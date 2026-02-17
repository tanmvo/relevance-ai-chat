import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { getItineraryByChatId, addItineraryItem } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type ToolDeps = {
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const addActivity = ({ chatId, dataStream }: ToolDeps) =>
  tool({
    description:
      "Add an activity, meal, or point of interest to a specific day and time block in the itinerary. Use real, specific place names. The item will be appended to the end of the time block.",
    inputSchema: z.object({
      day: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .describe("The date this activity belongs to, in YYYY-MM-DD format"),
      timeBlock: z
        .enum(["morning", "evening"])
        .describe("Time of day: morning or evening"),
      type: z
        .enum(["activity", "meal"])
        .describe("Item type: activity (sightseeing, tours, etc.) or meal"),
      name: z
        .string()
        .describe(
          "Specific name of the place or activity, e.g. 'Tsukiji Outer Market'"
        ),
      description: z
        .string()
        .describe("Brief description of the activity or meal")
        .optional(),
      price: z
        .string()
        .describe(
          "Estimated price with currency, e.g. '$45 per person' or '¥3,500'"
        )
        .optional(),
      imageUrl: z
        .string()
        .url()
        .describe("URL for a representative image (placeholder for prototype)")
        .optional(),
    }),
    execute: async (input) => {
      const itinerary = await getItineraryByChatId({ chatId });
      if (!itinerary) {
        return "No itinerary found for this chat. Please try again.";
      }

      await addItineraryItem({
        itineraryId: itinerary.id,
        day: input.day,
        timeBlock: input.timeBlock,
        type: input.type,
        name: input.name,
        description: input.description,
        price: input.price,
        imageUrl: input.imageUrl,
      });

      dataStream.write({
        type: "data-itinerary-update",
        data: itinerary.id,
      });

      return `Added "${input.name}" to ${input.day} ${input.timeBlock} as ${input.type}.`;
    },
  });
