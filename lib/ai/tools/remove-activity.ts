import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import { getItineraryByChatId, removeItineraryItem } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type ToolDeps = {
  chatId: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const removeActivity = ({ chatId, dataStream }: ToolDeps) =>
  tool({
    description:
      "Remove an item from the itinerary by its ID. Use this when the organizer wants to swap, cancel, or delete an activity, meal, accommodation, or transport entry.",
    inputSchema: z.object({
      itemId: z
        .string()
        .uuid()
        .describe("The unique ID of the itinerary item to remove"),
    }),
    execute: async ({ itemId }) => {
      const itinerary = await getItineraryByChatId({ chatId });
      if (!itinerary) {
        return "No itinerary found for this chat. Please try again.";
      }

      await removeItineraryItem({ id: itemId });

      dataStream.write({
        type: "data-itinerary-update",
        data: itinerary.id,
      });

      return `Removed item ${itemId} from the itinerary.`;
    },
  });
