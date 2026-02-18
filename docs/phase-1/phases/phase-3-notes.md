# Phase 3 Completion Notes

> For the next agent working on Phase 4+. Read this before starting.

---

## What was done

### Tab System (Task 1)

**File:** `components/chat.tsx`

- Added Chat / Itinerary tab system using Radix `Tabs` from `@radix-ui/react-tabs`.
- Tab bar sits below `ChatHeader` as a standalone sticky row with two equal-width triggers.
- `MultimodalInput` is only visible on the Chat tab (hidden when Itinerary is active).
- Both tab panels stay mounted in the DOM (toggled via CSS `hidden` class) to preserve Chat scroll position when switching tabs.
- `Tabs` root replaces the outer `div` and receives the same layout classes (`flex h-dvh flex-col`).

**New dependency:** `@radix-ui/react-tabs` — shadcn-style Tabs component at `components/ui/tabs.tsx`.

### Itinerary Data Hook (Task 2)

**File:** `hooks/use-itinerary.ts`

- SWR hook: `useItinerary(chatId)` fetches `GET /api/itinerary?chatId={chatId}`.
- Returns `{ itinerary, items, isLoading, error, mutate }`.
- SWR key pattern: `/api/itinerary?chatId=${chatId}` (null key when chatId is falsy).
- Exports `ItineraryData` type combining `Itinerary` and `ItineraryItem[]`.

### Live Updates (Task 3)

**File:** `components/data-stream-handler.tsx`

- Replaced the Phase 2 placeholder with an SWR `mutate` call that revalidates any key starting with `/api/itinerary` when `data-itinerary-update` events arrive.
- This means the itinerary tab auto-refreshes whenever the AI makes a tool call that modifies the itinerary.

### Itinerary Components (Tasks 4-8)

Six new components in `components/itinerary/`:

| File | Component | Purpose |
|---|---|---|
| `itinerary-view.tsx` | `ItineraryView` | Top-level composition: loading skeleton, empty state routing, hero + day sections |
| `empty-state.tsx` | `ItineraryEmptyState` | Centered icon + "Start chatting to build your itinerary" message |
| `hero-section.tsx` | `HeroSection` | Trip name, destination (with map pin icon), date range, guest count |
| `day-section.tsx` | `DaySection` | Day header ("Day 1 — Tuesday, Apr 1") + three time block sections |
| `time-block-section.tsx` | `TimeBlockSection` | Morning/Afternoon/Night label with icon + item cards or "No activities yet" placeholder |
| `item-card.tsx` | `ItineraryItemCard` | Item type icon, badge, name, description, price. Parses transport `[type]` prefix into badge sub-label. |
| `index.ts` | — | Barrel export for `ItineraryView` |

**Component hierarchy:**

```
ItineraryView
├── ItinerarySkeleton (loading)
├── ItineraryEmptyState (no data)
├── HeroSection (trip metadata)
└── DaySection[] (one per day in date range)
    └── TimeBlockSection[] (morning, afternoon, night)
        └── ItineraryItemCard[] (activities, meals, accommodation, transport)
```

**Key design decisions:**

- **Empty days shown:** When trip dates are set, all days in the range appear as sections — even days with no items. This gives a visual scaffold of the full trip.
- **Transport name parsing:** `[flight] JAL Flight 123` is parsed via `/^\[(\w+)]\s*(.*)$/` — bracket prefix becomes a badge sub-label (e.g., "Transport — Flight"), remainder becomes the display name.
- **Date handling:** All date strings are parsed with `T00:00:00` suffix to avoid timezone offset issues (schema uses `mode: "string"`).
- **Max width:** Itinerary content is constrained to `max-w-4xl` (matching chat message width) via a wrapper in `chat.tsx`.

### removeActivity Tool Fix (Post-implementation)

**File:** `lib/ai/tools/remove-activity.ts`

The original `removeActivity` tool required a UUID `itemId`, but the AI never had access to item IDs (they aren't exposed in tool results or chat context). This caused the AI to ask the user for an ID — bad UX.

**Fix:** Redesigned the tool to accept a human-readable `name` (required) with optional `day` and `timeBlock` for disambiguation. The tool now:
1. Fetches all items for the itinerary
2. Filters by case-insensitive partial name match
3. Narrows by day/timeBlock if multiple matches
4. Returns helpful messages for zero or ambiguous matches

**File:** `lib/ai/prompts.ts` — Updated the `removeActivity` tool instruction from "by its ID" to "by its name."

---

## What Phase 4 needs to know

1. **Itinerary components are reusable.** `HeroSection`, `DaySection`, `TimeBlockSection`, and `ItineraryItemCard` are pure display components that accept data as props. The public itinerary page (`/itinerary/[id]`) can import and reuse them directly — only `ItineraryView` is chat-specific (uses `useItinerary` hook with `chatId`).

2. **Public route needs its own data fetching.** The current `GET /api/itinerary?chatId=xxx` requires auth and chat ownership. The public page at `/itinerary/[id]` will need either a new API route that fetches by itinerary ID without auth, or a server component that queries the DB directly.

3. **`getItineraryById({ id })` already exists** in `lib/db/queries.ts`. Use it for the public route. You'll also need `getItineraryItemsByItineraryId({ itineraryId })` for the items.

4. **Share link generation.** The itinerary ID is a UUID. The public URL format is `/itinerary/{itineraryId}`. The "Share" button needs `getItineraryByChatId` to get the itinerary ID from the current chat, then constructs the URL.

5. **No chat visibility check on public page.** The existing `chat.visibility` field controls chat access, but the public itinerary page should be accessible without auth. Consider whether to add a separate visibility field on the itinerary, or always allow public access via the link (security through obscurity with UUID).

6. **Tab state is client-side only.** The active tab (`chat` or `itinerary`) is React state in `components/chat.tsx`. It resets to `chat` on page load. There's no URL-based tab routing.
