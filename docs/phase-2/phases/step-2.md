# Step 2: AI Tool & System Prompt — Completion Notes

> Phase 2 Polls feature. Completed as part of the Holiday Trip Planning Assistant.

---

## Summary

Step 2 implemented the `createPoll` AI tool, registered it in the chat endpoint, and updated Alfred's system prompt with poll awareness (suggestion behavior and result processing).

---

## What was done

### createPoll Tool (`lib/ai/tools/create-poll.ts`)

Follows the existing factory pattern `({ chatId, dataStream }) => tool({...})`:

- **Input schema (Zod):** `question` (string) + `options` (array of 2-3 objects with `label` + optional `description`)
- **Execute function:**
  1. Looks up the itinerary for the current chat via `getItineraryByChatId`
  2. Creates the poll in the DB via `createPoll` query (reuses Step 1 query)
  3. Writes `data-poll-update` event to the data stream (for SWR revalidation in Step 3)
  4. Returns poll data: `{ success, pollId, question, options, shareUrl }` for generative UI rendering

### Chat Endpoint Registration

- Imported `createPoll` in `app/(chat)/api/chat/route.ts`
- Added `createPoll: createPoll({ chatId: id, dataStream })` to the `tools` object in `streamText()`

### System Prompt Updates (`lib/ai/prompts.ts`)

Added three sections to Alfred's prompt:

1. **Tool listing:** Added `createPoll` to the tool usage section with a one-line description
2. **Poll suggestion behavior:** When to suggest a poll (decision points with 2-3 options, guest input requests), always wait for confirmation — never auto-create
3. **Poll result processing:** Hybrid approach — auto-update itinerary for clear majorities, ask for clarification on ambiguous/tie/insufficient-context results. Process one at a time.

---

## Files affected

### Created

- `lib/ai/tools/create-poll.ts`

### Modified

- `app/(chat)/api/chat/route.ts` — imported and registered `createPoll` tool
- `lib/ai/prompts.ts` — added `createPoll` tool description, poll suggestion behavior, and poll result processing sections

---

## Remaining

- [ ] E2E test: verify the agent can create a poll via conversation and data persists correctly. This requires a running dev environment with a database and is left for manual testing.

## Notes

- **Confidence:** 8/10. The tool and registration were straightforward (9/10) since they follow established patterns. The system prompt wording (8/10) required careful alignment with the PRD's design principles.
- The tool returns a `shareUrl` as a relative path (`/poll/{id}`) — the frontend or public page will resolve the full URL.
- The `data-poll-update` event type is consistent with the existing `data-itinerary-update` pattern. Step 3 will add a `DataStreamHandler` listener for this event.
- The tool return value includes `success`, `pollId`, `question`, `options` (with IDs), and `shareUrl` — this provides everything the generative UI components in Step 3 will need.
