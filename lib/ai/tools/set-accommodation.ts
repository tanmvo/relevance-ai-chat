import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  getItineraryByChatId,
  setAccommodation as setAccommodationQuery,
} from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type ToolDeps = {
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const setAccommodation = ({ chatId, dataStream }: ToolDeps) =>
  tool({
    description:
      "Set or update accommodation for a specific night and time block. This upserts — if accommodation already exists for that day/timeBlock, it will be replaced. Typically use the 'night' time block for hotels.",
    inputSchema: z.object({
      day: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .describe(
          "The date for this accommodation (the night of), in YYYY-MM-DD format"
        ),
      timeBlock: z
        .enum(["morning", "afternoon", "night"])
        .describe(
          "Time block — typically 'night' for hotel stays, 'morning' for check-out"
        ),
      name: z
        .string()
        .describe("Hotel or accommodation name, e.g. 'Park Hyatt Tokyo'"),
      description: z
        .string()
        .describe("Brief description of the accommodation")
        .optional(),
      price: z
        .string()
        .describe(
          "Nightly rate with currency, e.g. '$280/night' or '¥35,000/night'"
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

      await setAccommodationQuery({
        itineraryId: itinerary.id,
        day: input.day,
        timeBlock: input.timeBlock,
        name: input.name,
        description: input.description,
        price: input.price,
        imageUrl: input.imageUrl,
      });

      dataStream.write({
        type: "data-itinerary-update",
        data: itinerary.id,
      });

      return `Set accommodation for ${input.day} ${input.timeBlock}: ${input.name}`;
    },
  });
