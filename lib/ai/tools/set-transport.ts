import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  getItineraryByChatId,
  setTransport as setTransportQuery,
} from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type ToolDeps = {
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const setTransport = ({ chatId, dataStream }: ToolDeps) =>
  tool({
    description:
      "Set or update transport for a specific day and time block. This upserts — if transport already exists for that day/timeBlock, it will be replaced. Use for flights, trains, car rentals, and bus services.",
    inputSchema: z.object({
      day: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .describe("The date for this transport, in YYYY-MM-DD format"),
      timeBlock: z
        .enum(["morning", "afternoon", "night"])
        .describe("Time of day for the transport"),
      transportType: z
        .enum(["flight", "train", "car", "bus"])
        .describe("Type of transport"),
      name: z
        .string()
        .describe(
          "Transport name or description, e.g. 'JAL Flight 123 NRT→KIX' or 'Shinkansen Nozomi to Kyoto'"
        ),
      description: z
        .string()
        .describe("Additional details about the transport")
        .optional(),
      price: z
        .string()
        .describe("Price with currency, e.g. '$350 per person' or '¥14,000'")
        .optional(),
    }),
    execute: async (input) => {
      const itinerary = await getItineraryByChatId({ chatId });
      if (!itinerary) {
        return "No itinerary found for this chat. Please try again.";
      }

      await setTransportQuery({
        itineraryId: itinerary.id,
        day: input.day,
        timeBlock: input.timeBlock,
        name: `[${input.transportType}] ${input.name}`,
        description: input.description,
        price: input.price,
      });

      dataStream.write({
        type: "data-itinerary-update",
        data: itinerary.id,
      });

      return `Set ${input.transportType} for ${input.day} ${input.timeBlock}: ${input.name}`;
    },
  });
