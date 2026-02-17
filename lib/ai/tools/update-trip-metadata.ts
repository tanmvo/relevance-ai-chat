import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  getItineraryByChatId,
  updateItineraryMetadata,
} from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type ToolDeps = {
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const updateTripMetadata = ({ chatId, dataStream }: ToolDeps) =>
  tool({
    description:
      "Set or update trip-level metadata: trip name, destination, travel dates, number of adults, and number of children. Call this as soon as the organizer confirms any of these details. All fields are optional — include only the fields being set or changed.",
    inputSchema: z.object({
      tripName: z
        .string()
        .describe("Display name for the trip, e.g. 'Tokyo Spring Adventure'")
        .optional(),
      destination: z
        .string()
        .describe("Destination name or region, e.g. 'Tokyo, Japan'")
        .optional(),
      startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .describe("Trip start date in YYYY-MM-DD format")
        .optional(),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .describe("Trip end date in YYYY-MM-DD format")
        .optional(),
      adults: z
        .number()
        .int()
        .min(0)
        .describe("Number of adult guests")
        .optional(),
      children: z
        .number()
        .int()
        .min(0)
        .describe("Number of child guests")
        .optional(),
    }),
    execute: async (input) => {
      const itinerary = await getItineraryByChatId({ chatId });
      if (!itinerary) {
        return "No itinerary found for this chat. Please try again.";
      }

      const hasUpdates = Object.values(input).some(
        (value) => value !== undefined
      );
      if (!hasUpdates) {
        return "No fields provided to update.";
      }

      await updateItineraryMetadata({ id: itinerary.id, ...input });

      dataStream.write({
        type: "data-itinerary-update",
        data: itinerary.id,
      });

      const updatedFields: string[] = [];
      if (input.tripName !== undefined) {
        updatedFields.push(`trip name: ${input.tripName}`);
      }
      if (input.destination !== undefined) {
        updatedFields.push(`destination: ${input.destination}`);
      }
      if (input.startDate !== undefined) {
        updatedFields.push(`start date: ${input.startDate}`);
      }
      if (input.endDate !== undefined) {
        updatedFields.push(`end date: ${input.endDate}`);
      }
      if (input.adults !== undefined) {
        updatedFields.push(`adults: ${input.adults}`);
      }
      if (input.children !== undefined) {
        updatedFields.push(`children: ${input.children}`);
      }

      return `Updated trip metadata: ${updatedFields.join(", ")}`;
    },
  });
