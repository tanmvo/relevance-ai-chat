import { gateway } from "@ai-sdk/gateway";
import { generateText, tool } from "ai";
import { z } from "zod";

/**
 * Custom web search tool that wraps the Perplexity sonar model via the
 * AI Gateway. Unlike `gateway.tools.perplexitySearch()` (a provider-executed
 * tool with no local `execute`), this custom tool has a proper `execute`
 * function. This is critical for the AI SDK's multi-step loop: without a
 * local `execute`, the SDK won't trigger a follow-up step to let the model
 * generate text from the search results.
 */
export const webSearch = tool({
  description:
    "Search the web for real-time information about destinations, activities, accommodations, restaurants, transport options, and travel logistics. Use this to find up-to-date recommendations, prices, and availability.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "A specific, detailed search query. Include location, dates, and context for best results."
      ),
  }),
  execute: async ({ query }) => {
    const { text } = await generateText({
      model: gateway("perplexity/sonar"),
      prompt: query,
    });

    return text;
  },
});
