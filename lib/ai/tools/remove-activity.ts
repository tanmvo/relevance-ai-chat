import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  getItineraryByChatId,
  getItineraryItemsByItineraryId,
  removeItineraryItem,
} from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type ToolDeps = {
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const removeActivity = ({ chatId, dataStream }: ToolDeps) =>
  tool({
    description:
      "Remove an item from the itinerary by name. Matches the item by name (case-insensitive, partial match). Optionally provide the day and/or time block to disambiguate if multiple items share similar names.",
    inputSchema: z.object({
      name: z
        .string()
        .describe(
          "The name (or partial name) of the itinerary item to remove, e.g. 'The Farm Byron Bay'"
        ),
      day: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .describe("Optional: the day the item is on, to disambiguate")
        .optional(),
      timeBlock: z
        .enum(["morning", "afternoon", "night"])
        .describe("Optional: the time block the item is in, to disambiguate")
        .optional(),
    }),
    execute: async ({ name, day, timeBlock }) => {
      const itinerary = await getItineraryByChatId({ chatId });
      if (!itinerary) {
        return "No itinerary found for this chat. Please try again.";
      }

      const items = await getItineraryItemsByItineraryId({
        itineraryId: itinerary.id,
      });

      const searchName = name.toLowerCase();
      let matches = items.filter((item) =>
        item.name.toLowerCase().includes(searchName)
      );

      if (matches.length === 0) {
        return `No item matching "${name}" found in the itinerary. Available items: ${items.map((i) => i.name).join(", ")}`;
      }

      if (matches.length > 1 && day) {
        const dayFiltered = matches.filter((item) => item.day === day);
        if (dayFiltered.length > 0) {
          matches = dayFiltered;
        }
      }

      if (matches.length > 1 && timeBlock) {
        const blockFiltered = matches.filter(
          (item) => item.timeBlock === timeBlock
        );
        if (blockFiltered.length > 0) {
          matches = blockFiltered;
        }
      }

      if (matches.length > 1) {
        return `Multiple items match "${name}": ${matches.map((i) => `"${i.name}" (${i.day} ${i.timeBlock})`).join(", ")}. Please specify the day or time block to narrow it down.`;
      }

      const target = matches[0];
      await removeItineraryItem({ id: target.id });

      dataStream.write({
        type: "data-itinerary-update",
        data: itinerary.id,
      });

      return `Removed "${target.name}" from ${target.day} ${target.timeBlock}.`;
    },
  });
