import { tool } from "ai";
import { z } from "zod";

export const presentSuggestions = tool({
  description:
    "ALWAYS use this tool instead of listing options in plain text. Present 2-4 options as an interactive card the trip planner can tap to choose from. Use this for ANY kind of choice: destinations, travel dates, weekend options, travel style preferences, activities, restaurants, hotels, transport — whenever the organizer needs to pick between discrete options.",
  inputSchema: z.object({
    context: z
      .string()
      .describe(
        "Brief heading describing the choice, e.g. 'Weekend options for Hobart', 'Day 1 morning activities in Kyoto', 'Destination ideas for a beach holiday'"
      ),
    suggestions: z
      .array(
        z.object({
          title: z
            .string()
            .describe(
              "The option label, e.g. 'Fushimi Inari Shrine', 'March 7–9', 'Bali, Indonesia'"
            ),
          description: z
            .string()
            .max(80)
            .describe(
              "One short sentence (max 80 chars) with helpful context, e.g. 'Friday–Sunday, warm weather expected'"
            )
            .optional(),
          type: z
            .enum([
              "activity",
              "meal",
              "accommodation",
              "transport",
              "experience",
              "destination",
            ])
            .describe("Category of the suggestion, if applicable")
            .optional(),
          estimatedPrice: z
            .string()
            .describe(
              "Price estimate if applicable, e.g. '$25 per person'"
            )
            .optional(),
          duration: z
            .string()
            .describe("Estimated duration if applicable, e.g. '2-3 hours'")
            .optional(),
        })
      )
      .min(2)
      .max(4)
      .describe("2-4 options to present"),
  }),
  execute: async (input) => ({
    context: input.context,
    suggestions: input.suggestions,
  }),
});
