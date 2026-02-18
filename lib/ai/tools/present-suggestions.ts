import { tool } from "ai";
import { z } from "zod";

export const presentSuggestions = tool({
  description:
    "Present 2-4 suggestion options to the trip planner as an interactive card. Use this when offering activity, restaurant, accommodation, or experience choices for a specific day or decision point. The organizer can select their preferred option directly from the card.",
  inputSchema: z.object({
    context: z
      .string()
      .describe(
        "Brief context about what the suggestions are for, e.g. 'Day 1 morning activities in Kyoto'"
      ),
    suggestions: z
      .array(
        z.object({
          title: z
            .string()
            .describe(
              "Name of the suggestion, e.g. 'Fushimi Inari Shrine'"
            ),
          description: z
            .string()
            .max(80)
            .describe(
              "One short sentence (max 80 chars) summarizing the option, e.g. 'Iconic hilltop shrine with thousands of vermillion torii gates'"
            )
            .optional(),
          type: z
            .enum([
              "activity",
              "meal",
              "accommodation",
              "transport",
              "experience",
            ])
            .describe("Category of the suggestion")
            .optional(),
          estimatedPrice: z
            .string()
            .describe(
              "Price estimate if applicable, e.g. '$25 per person'"
            )
            .optional(),
          duration: z
            .string()
            .describe("Estimated duration, e.g. '2-3 hours'")
            .optional(),
        })
      )
      .min(2)
      .max(4)
      .describe("2-4 suggestion options to present"),
  }),
  execute: async (input) => ({
    context: input.context,
    suggestions: input.suggestions,
  }),
});
