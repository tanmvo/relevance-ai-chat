# Phase 1 Completion Notes

> For the next agent working on Phase 2+. Read this before starting.

---

## What was done

### Artifact / tool removal (Task 2)

- **Deleted files** (via git, already staged): `lib/ai/tools/get-weather.ts`, `create-document.ts`, `update-document.ts`, `request-suggestions.ts`, entire `artifacts/` directory, `lib/artifacts/server.ts`, `app/(chat)/api/document/route.ts`, `app/(chat)/api/suggestions/route.ts`, and many artifact-related components (`components/artifact.tsx`, `artifact-actions.tsx`, `artifact-close-button.tsx`, `artifact-messages.tsx`, `create-artifact.tsx`, `toolbar.tsx`, `version-footer.tsx`, `document.tsx`, `document-preview.tsx`, `document-skeleton.tsx`, `suggestion.tsx`).
- **`components/message.tsx`**: Removed all tool UI blocks (`tool-getWeather`, `tool-createDocument`, `tool-updateDocument`, `tool-requestSuggestions`) and `Weather` import. The `Tool`, `ToolContent`, `ToolHeader`, `ToolInput`, `ToolOutput` imports were removed. `addToolApprovalResponse` is prefixed with `_` (unused for now — Phase 2 tools may need it again).
- **`lib/ai/prompts.ts`**: Artifact-related prompts (`artifactsPrompt`, `codePrompt`, `sheetPrompt`, `updateDocumentPrompt`) were already removed. Only `regularPrompt`, `getRequestPromptFromHints`, `systemPrompt`, and `titlePrompt` remain.
- **`app/(chat)/api/chat/route.ts`**: `tools: {}` is an empty object — ready for Phase 2 to add new tools.
- **`components/data-stream-handler.tsx`**: Gutted to only handle `data-chat-title`. Shell is ready for Phase 2 itinerary stream events.

### Files still referencing artifact/document (not blocking)

These exist but are **not breaking** — they're either legacy types, UI primitives, or editor code that may be cleaned up later:

- `lib/artifact-types.ts` — exports `ArtifactKind` type, used by `lib/editor/suggestions.tsx`
- `hooks/use-artifact.ts` — minimal stub with `UIArtifact` type, used by `components/console.tsx`
- `components/ai-elements/artifact.tsx` — reusable UI primitives (Artifact, ArtifactHeader, etc.), not the old artifact viewer
- `lib/editor/suggestions.tsx`, `lib/editor/functions.tsx`, `lib/editor/config.ts` — ProseMirror editor code, references `document` (DOM), `suggestion` (editor concept), not DB tables
- `components/text-editor.tsx`, `components/code-editor.tsx` — editor components that reference suggestions (ProseMirror, not DB)
- `lib/ai/providers.ts` — still exports `getArtifactModel()`, can be removed when no longer needed
- `lib/db/schema.ts` — `document` and `suggestion` **tables are kept** (no destructive migration) but **no query functions reference them** in `lib/db/queries.ts`

### Schema (Task 3)

Two new tables in `lib/db/schema.ts`:

- **`Itinerary`** — `id` (PK), `chatId` (unique FK → Chat), `tripName`, `destination`, `startDate`, `endDate`, `adults`, `children`, `createdAt`, `updatedAt`
- **`ItineraryItem`** — `id` (PK), `itineraryId` (FK → Itinerary), `day` (date), `timeBlock` (morning/afternoon/night), `type` (activity/accommodation/transport/meal), `name`, `description`, `price`, `imageUrl`, `sortOrder`, `createdAt`

Key design decisions:
- `chatId` on Itinerary has a `unique()` constraint — enforces 1:1 with Chat
- Date columns use `mode: "string"` to avoid timezone issues
- Metadata fields are nullable — itinerary starts empty
- No `updatedAt` on items (keeping it simple for prototype)

### Migration (Task 4)

- **`lib/db/migrations/0009_itinerary_tables.sql`** — creates both tables with FKs and unique constraint
- **`lib/db/migrations/meta/_journal.json`** — entry added at `idx: 9`
- Migration has been applied and verified

### CRUD queries (Task 5)

New functions in `lib/db/queries.ts`:

| Function | Purpose |
|---|---|
| `createItinerary({ chatId })` | Insert new itinerary for a chat |
| `getItineraryByChatId({ chatId })` | Fetch itinerary by chat ID (returns null if not found) |
| `getItineraryById({ id })` | Fetch itinerary by its own ID |
| `updateItineraryMetadata({ id, tripName?, destination?, startDate?, endDate?, adults?, children? })` | Partial update of itinerary metadata |
| `addItineraryItem({ itineraryId, day, timeBlock, type, name, description?, price?, imageUrl?, sortOrder? })` | Add an item to the itinerary |
| `removeItineraryItem({ id })` | Delete an item |
| `getItineraryItemsByItineraryId({ itineraryId })` | Get all items for an itinerary (ordered by day, sortOrder) |
| `updateItineraryItem({ id, day?, timeBlock?, type?, name?, description?, price?, imageUrl?, sortOrder? })` | Partial update of an item |
| `setAccommodation({ itineraryId, day, timeBlock, name, ... })` | Upsert accommodation for a day/timeBlock |
| `setTransport({ itineraryId, day, timeBlock, name, ... })` | Upsert transport for a day/timeBlock |

**Cascade deletes**: `deleteChatById` and `deleteAllChatsByUserId` now delete `ItineraryItem` → `Itinerary` before deleting the chat.

### Auto-create itinerary (Task 6)

In `app/(chat)/api/chat/route.ts`, after `saveChat(...)`:
- Checks if itinerary already exists (`getItineraryByChatId`)
- Creates one if missing (`createItinerary`)
- This is idempotent (safe for races / retries)

### API route (Task 7)

**GET `/api/itinerary?chatId=<chatId>`** — `app/(chat)/api/itinerary/route.ts`

- Requires auth (session check)
- Validates chat ownership
- **Auto-creates** an itinerary if the chat exists but has no itinerary (handles pre-Phase-1 chats)
- Returns `{ itinerary, items }` as JSON
- Wrapped in try/catch for proper error responses

---

## What Phase 2 needs to know

1. **Tools go in `app/(chat)/api/chat/route.ts`** — the `tools: {}` object is empty and ready. Import tool definitions and add them there. Don't forget `experimental_activeTools` if needed.

2. **System prompt is in `lib/ai/prompts.ts`** — `systemPrompt()` currently returns `regularPrompt + requestPrompt`. Replace `regularPrompt` with the Alfred persona prompt. The function signature already receives `selectedChatModel` and `requestHints`.

3. **Query functions are ready** — `addItineraryItem`, `updateItineraryMetadata`, `setAccommodation`, `setTransport`, `removeItineraryItem`, `updateItineraryItem` are all exported from `lib/db/queries.ts`. Tools can import and call them directly.

4. **`getItineraryByChatId({ chatId })` is the key lookup** — tools will need the itinerary ID to add items. Pattern: get itinerary by chatId → use `itinerary.id` as `itineraryId` for item operations.

5. **`data-stream-handler.tsx` is ready for new event types** — currently only handles `data-chat-title`. Add new delta types (e.g. `data-itinerary-update`) in the `for (const delta of newDeltas)` loop.

6. **`message.tsx` tool rendering** — tool UI blocks were removed. Phase 2 tools will need new rendering blocks in the `message.parts.map()` section for any tools that need visible UI in the chat.

7. **Zod schemas for tool inputs** — follow the pattern in `app/(chat)/api/chat/schema.ts` (which defines `postRequestBodySchema`). Define Zod schemas for each tool's input parameters.

8. **TimeBlock and ItemType enums** — defined in the schema as varchar enums: `"morning" | "afternoon" | "night"` and `"activity" | "accommodation" | "transport" | "meal"`. Use these exact string literals in tool Zod schemas.
