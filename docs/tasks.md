# Task List — Holiday Trip Planning Assistant

> Tasks are grouped by phase. Each phase will be planned in detail before starting.
> Phases are sequential — each builds on the previous.

---

## Phase 1: Codebase Preparation & Data Model

Strip the existing chatbot down to what we need and lay the data foundation.

- [x] Audit existing tools and artifacts — identify what to remove/repurpose (`getWeather`, `createDocument`, `updateDocument`, `requestSuggestions`, artifact handlers)
- [x] Remove or disable unused artifact types (code, image, sheet)
- [x] Design itinerary schema (Drizzle ORM) — metadata (trip name, destination, dates, adults, children) + days → time blocks (morning/afternoon/night) → items (activity/accommodation/transport/meal)
- [x] Create database migration for itinerary table(s)
- [x] Build itinerary CRUD queries in `lib/db/queries.ts`
- [x] Auto-create an empty itinerary when a new chat is created
- [x] Add API route(s) for reading itinerary data

---

## Phase 2: AI Agent & Tools

Set up the trip planning persona, conversation directives, and granular tools.

- [x] Write system prompt — Alfred persona, conversation style lifecycle (ask-first → facilitator → proactive), trip planning context
- [x] Build granular itinerary tools — `addActivity`, `removeActivity`, `setAccommodation`, `setTransport`, `updateTripMetadata` (destination, dates, guest count)
- [x] Define Zod schemas for each tool's input
- [x] Build `webSearch` tool — destination-scoped research via `gateway.tools.perplexitySearch()`
- [x] Register all new tools in the chat endpoint (`api/chat/route.ts`)
- [x] Remove old tool registrations (already done in Phase 1)
- [X] Test tool calls end-to-end — verify itinerary updates persist correctly

---

## Phase 3: Itinerary UI

Build the itinerary view as a second tab alongside the chat, mobile-first.

- [x] Add tab system to chat page (Chat | Itinerary)
- [x] Build itinerary empty state (no trip details yet)
- [x] Build hero section component (trip name, destination, dates, guest count)
- [x] Build day section card component (collapsible or scrollable day cards)
- [x] Build time block layout within each day (Morning, Afternoon, Night)
- [x] Build itinerary item cards (activity, accommodation, transport, meal — with placeholder image, name, description, price)
- [x] Wire itinerary view to backend data (fetch itinerary for current chat)
- [x] Live updates — itinerary view refreshes when AI makes tool calls during chat
- [x] Mobile-first responsive styling across all new components

---

## Phase 4: Public Share

Let the trip organizer share a read-only itinerary link with guests.

- [ ] Create public itinerary route (`/itinerary/[id]`) — no auth required
- [ ] Reuse itinerary view components from Phase 3 (hero, day cards, item cards)
- [ ] Generate shareable link for each itinerary
- [ ] Add "Share" action in the chat UI to copy the public link
- [ ] Ensure public page has no chat access, no editing, no sidebar

---

## Parking Lot (Future Phases)

Features explicitly deferred. Not planned, not estimated — just captured.

- [ ] Vector knowledge base for AI recommendations
- [ ] Guest preference collection
- [ ] Conflict resolution tools (voting, compromise suggestions)
- [ ] Budget tracking and expense splitting
- [ ] External travel API integrations (flights, hotels, restaurants)
- [ ] Calendar sync (Google Calendar, Apple Calendar)
- [ ] PDF / Google Docs export
- [ ] Push / email notifications
- [ ] Cross-session memory
- [ ] Offline access
