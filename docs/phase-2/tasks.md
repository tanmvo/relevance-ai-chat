# Task List — Polls Feature (Phase 2)

> Tasks are grouped by step. Each step builds on the previous.
> Steps are sequential — complete each before moving to the next.
> **Related:** [PRD](./PRD.md) · [Questionnaire](./drafts/questionaire.md)

---

## Step 1: Data Model & API Foundation

Design the poll schema, build CRUD queries, and expose API routes.

- [x] Design poll schema (Drizzle ORM) — `Poll` (id, chatId, itineraryId, question, type, status, timestamps), `PollOption` (id, pollId, label, description, sortOrder), `PollVote` (id, pollOptionId, voterName, createdAt)
- [x] Create database migration for Poll, PollOption, and PollVote tables
- [x] Build poll CRUD queries in `lib/db/queries.ts` — `createPoll`, `getPollsByChatId` (with options + vote counts), `getPollById` (with options + votes), `submitPoll` (set status to submitted), `castVote`
- [x] Add authenticated API route `GET /api/poll?chatId=<id>` — returns all polls for a chat with options and aggregated vote counts
- [x] Add authenticated API route `POST /api/poll` — creates a new poll with options (used by the tool's execute function)
- [x] Add authenticated API route `PATCH /api/poll/[id]/submit` — sets poll status to submitted
- [x] Add public API route `GET /api/poll/[id]/public` — returns poll with options and full vote data (no auth)
- [x] Add public API route `POST /api/poll/[id]/vote` — casts a vote with `{ optionId, voterName }` (no auth)

---

## Step 2: AI Tool & System Prompt

Build the `createPoll` tool and update Alfred's prompt with poll awareness.

- [x] Build `createPoll` tool in `lib/ai/tools/create-poll.ts` — follows existing factory pattern `({ chatId, dataStream })`, Zod input schema (question, options array with label + optional description), execute function creates poll in DB and writes `data-poll-update` event to data stream
- [x] Register `createPoll` tool in the chat endpoint (`api/chat/route.ts`)
- [x] Update system prompt in `lib/ai/prompts.ts` — add poll suggestion behavior (suggest creating a poll at decision points, never auto-create) and poll result processing behavior (hybrid: auto-update if decisive, ask if ambiguous)
- [ ] Test tool call end-to-end — verify the agent can create a poll and data persists correctly

---

## Step 3: Generative UI — Poll Components

Build the React components that render inline in the chat for poll creation and results.

- [x] Add `needsApproval: true` to `createPoll` tool in `lib/ai/tools/create-poll.ts` — enables AI SDK tool approval flow (tool pauses at `approval-requested`, executes only after user approves)
- [x] Update `lib/types.ts` — add `createPoll` to `ChatTools` type, add `"poll-update"` to `CustomUIDataTypes`
- [x] Build `PollCreationCard` component — **configuring state (`approval-requested`):** read-only preview of AI's suggested question + options, "Create Poll" (approve) and "Deny" buttons using `addToolApprovalResponse`; **created state (`output-available`):** read-only summary, copy-to-clipboard share link
- [x] Build `PollSummaryCard` component — **active state:** question, per-option vote count/percentage/voter names, horizontal bar chart (Tailwind), total votes, copy link + "Submit to Agent" buttons; **submitted state:** same content but read-only, "Submitted" badge, buttons hidden
- [x] Wire `tool-createPoll` message parts in the chat message renderer — specific check before generic `tool-*` handler, renders `PollCreationCard` on approval/error states, `PollSummaryCard` on `output-available` with pollId
- [x] Build `usePoll` SWR hook in `hooks/use-poll.ts` — fetches poll data via `/api/poll/[id]/public` with `refreshInterval: 5000` for live updates (same pattern as `useItinerary`)
- [x] Build `usePolls` SWR hook in `hooks/use-polls.ts` — fetches all polls for a chat via `/api/poll?chatId=<id>` (used by the polls tab)
- [x] Add `DataStreamHandler` listener for `data-poll-update` events — triggers SWR revalidation for all `/api/poll*` keys
- [x] Mobile-first responsive styling for all poll components — full-width cards on mobile, responsive text/padding, touch-friendly targets

---

## Step 4: Public Poll Page

Build the guest-facing voting page.

- [x] Create public poll route at `app/poll/[id]/page.tsx` — server component with metadata generation, no auth required; layout at `app/poll/[id]/layout.tsx` follows itinerary pattern
- [x] Build page layout — trip context header (trip name, destination, dates from linked itinerary), poll question with icon, options as selectable cards (label + description)
- [x] Build voting form — name text input with label, radio-style option cards with letter indices and selection ring, submit button with disabled state and loading text, client-side validation
- [x] Build post-vote view — "Thank you" banner with voter name, current results (vote counts, percentages, voter names, horizontal bar chart), live-updating via `usePoll` SWR hook (5s refresh)
- [x] Built read-only `PollResults` component using same OptionBar visual pattern from `PollSummaryCard` — reused for both post-vote and closed states
- [x] Mobile-first responsive styling — full-width cards, responsive padding, touch-friendly option cards

---

## Step 5: Polls Tab

Add the third tab to the chat page with a poll list and detail view.

- [x] Add "Polls" tab to the existing Radix tab system — tab order: Chat | Polls | Itinerary
- [x] Keep all three tabs mounted via CSS toggle (consistent with existing Chat/Itinerary pattern)
- [x] Build polls list view — compact cards sorted by status (active first, then submitted), each showing question, status badge, vote count
- [x] Build polls empty state — "Create a poll by asking in the Chat"
- [x] Build bottom sheet detail view (Radix Sheet / Dialog) — opens on poll card tap, renders the full `PollSummaryCard`
- [x] Wire polls tab to `usePolls` hook for data fetching
- [x] Mobile-first responsive styling

---

## Step 6: Submit to Agent Flow

Wire the submit action to inject poll results into the chat.

- [x] Build submit UI — "Submit to Agent" button on `PollSummaryCard`, opens optional text input for trip planner's message, confirmation step
- [x] On submit: call `PATCH /api/poll/[id]/submit` to update poll status
- [x] Inject poll results as a user message into the chat — include question, options with vote counts/percentages, voter names, and the trip planner's optional message
- [x] After submission: `PollSummaryCard` transitions to submitted state (badge, buttons hidden)
- [ ] Verify agent processes results correctly — auto-updates itinerary for decisive results, asks follow-ups for ambiguous/insufficient context
- [ ] End-to-end test: create poll → share → vote → submit → agent updates itinerary

---

## Parking Lot (Future)

Features explicitly deferred. Not planned, not estimated — just captured.

- [ ] Poll deadlines / expiry
- [ ] Anonymous voting
- [ ] Authenticated guest voting
- [ ] Duplicate vote prevention
- [ ] Poll templates
- [ ] Rich media in options (images, links)
- [ ] Vote change after submission
- [ ] Multi-select polls (pick many)
- [ ] Yes/No single-option polls
- [ ] Poll deletion from UI
- [ ] Structured itinerary context (day/timeBlock linkage)
- [ ] Notifications when votes arrive
- [ ] Poll analytics / export
- [ ] Bottom navigation bar for mobile (when tab count grows)
