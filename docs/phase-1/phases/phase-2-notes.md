# Phase 2 Completion Notes

> For the next agent working on Phase 3+. Read this before starting.

---

## What was done

### System Prompt (Task 1)

**File:** `lib/ai/prompts.ts`

- Replaced `regularPrompt` with the Alfred persona prompt covering: identity, conversation style lifecycle (Ask-First → Neutral Facilitator → Proactive Suggestions), tool usage instructions, and knowledge boundaries.
- Updated `titlePrompt` to generate trip-oriented titles (e.g., "Tokyo Spring Trip").
- `systemPrompt()` function signature unchanged — still receives `selectedChatModel` and `requestHints`.

### Tool Implementations (Tasks 2-3)

Five itinerary tool files created in `lib/ai/tools/`:

| File | Tool | DB Query Used |
|---|---|---|
| `update-trip-metadata.ts` | `updateTripMetadata` | `getItineraryByChatId` → `updateItineraryMetadata` |
| `add-activity.ts` | `addActivity` | `getItineraryByChatId` → `addItineraryItem` |
| `remove-activity.ts` | `removeActivity` | `getItineraryByChatId` → `removeItineraryItem` |
| `set-accommodation.ts` | `setAccommodation` | `getItineraryByChatId` → `setAccommodation` (upsert) |
| `set-transport.ts` | `setTransport` | `getItineraryByChatId` → `setTransport` (upsert) |

**Web search:** Custom tool in `lib/ai/tools/web-search.ts`. Uses `generateText()` with the Perplexity `sonar` model via `gateway("perplexity/sonar")` from `@ai-sdk/gateway`. See "Multi-step fix" section below for why this replaced `gateway.tools.perplexitySearch()`.

**Common pattern:** Each itinerary tool is a factory function that receives `{ chatId, dataStream }` and returns a `tool()` definition. After mutating the DB, each tool writes a `data-itinerary-update` event to the data stream.

### Route Wiring (Task 4)

**File:** `app/(chat)/api/chat/route.ts`

- Imported all 5 tool factory functions and the custom `webSearch` tool.
- Registered all 6 tools in the `tools: {}` object inside `streamText()`.
- Tools receive `chatId: id` and `dataStream` from the execute callback scope.
- Added `await result.steps` after `dataStream.merge()` to keep the stream alive through the full multi-step flow (see "Multi-step fix" below).

### Type Updates (Task 5)

**File:** `lib/types.ts`

- `ChatTools` now uses `InferUITool<ReturnType<typeof factory>>` for all 5 itinerary tools. `webSearch` (gateway tool) is not included in the type — the SDK handles it gracefully.
- `CustomUIDataTypes` cleaned up: removed stale entries (`textDelta`, `imageDelta`, `sheetDelta`, `codeDelta`, `id`, `title`, `kind`, `clear`, `finish`). Now only has `"chat-title": string` and `"itinerary-update": string`.

### DataStreamHandler (Task 6)

**File:** `components/data-stream-handler.tsx`

- Added handler for `data-itinerary-update` events. Currently a no-op placeholder — Phase 3 will wire it to SWR mutation to refresh the itinerary view.

### Tool Call Rendering (Task 7)

**File:** `components/message.tsx`

- Re-imported `Tool`, `ToolContent`, `ToolHeader` from `components/elements/tool.tsx`.
- Added `toolDisplayNames` map for human-readable tool names in the UI.
- Added a catch-all rendering block for any `type.startsWith("tool-")` parts. Uses the existing `Tool`/`ToolHeader` components with human-readable labels.
- Shows tool output text when `state === "output-available"` and error text when `state === "output-error"`.

**File:** `components/elements/tool.tsx`

- Changed `ToolHeaderProps.type` from `ToolUIPart["type"]` to `string` to accept human-readable display names instead of raw tool type strings.

### Multi-step Fix (Post-implementation)

Two issues prevented the AI from generating a text response after making tool calls:

**Issue 1 — Stream closing prematurely.** The `execute` callback in `createUIMessageStream` called `dataStream.merge()` (non-blocking) and then returned, closing the stream before `streamText` could complete its multi-step loop. **Fix:** Added `await result.steps` after the merge call to keep the callback alive until all steps finish.

**Issue 2 — Provider-executed tools don't trigger multi-step.** `gateway.tools.perplexitySearch()` is a provider-executed tool — the AI Gateway runs it on its servers and returns results with `providerExecuted: true`. The AI SDK's multi-step loop only triggers follow-up steps for tools with a local `execute` function. Since provider-executed tools have no `execute`, the SDK never looped back to let the model generate text from search results. The SSE stream showed one step cycle ending with `finishReason: "tool-calls"` then `[DONE]`. **Fix:** Replaced `gateway.tools.perplexitySearch()` with a custom `webSearch` tool (`lib/ai/tools/web-search.ts`) that has a proper `execute` function. It calls Perplexity's `sonar` model via `gateway("perplexity/sonar")` using `generateText()`, which returns search-backed text with citations.

**Key takeaway for future tools:** Any tool registered with `streamText` must have a local `execute` function for multi-step to work. Provider-executed tools (e.g., `gateway.tools.*`, `openai.tools.*`) will execute but won't trigger a follow-up step for the model to process results.

---

## What Phase 3 needs to know

1. **Data stream events are emitted but not consumed.** Every tool call writes `{ type: "data-itinerary-update", data: itineraryId }` to the stream. `DataStreamHandler` receives it but does nothing. Phase 3 should hook this up to SWR mutation to refresh the itinerary tab.

2. **Tool names for rendering.** The `toolDisplayNames` map in `message.tsx` maps `"tool-{name}"` to display strings. If you add new tools, add entries here.

3. **`webSearch` tool typing.** The custom `webSearch` tool is not in the `ChatTools` type (it's a standalone tool, not a factory). The generic `type.startsWith("tool-")` rendering in `message.tsx` handles it. Its output is a text string (Perplexity sonar response with citations).

4. **`setTransport` prepends transport type.** The tool stores the name as `[flight] JAL Flight 123` (with transport type prefix). Phase 3's itinerary item cards may want to parse this or display it differently.

5. **No approval flow.** None of the new tools use tool approval (unlike the old `getWeather`). They execute immediately.

6. **All tools return informative strings.** The AI uses these return values to confirm actions in the chat. Example: `"Added 'Meiji Shrine' to 2026-04-01 morning as activity."`
