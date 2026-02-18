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

- [ ] Build `createPoll` tool in `lib/ai/tools/create-poll.ts` — follows existing factory pattern `({ chatId, dataStream })`, Zod input schema (question, options array with label + optional description), execute function creates poll in DB and writes `data-poll-update` event to data stream
- [ ] Register `createPoll` tool in the chat endpoint (`api/chat/route.ts`)
- [ ] Update system prompt in `lib/ai/prompts.ts` — add poll suggestion behavior (suggest creating a poll at decision points, never auto-create) and poll result processing behavior (hybrid: auto-update if decisive, ask if ambiguous)
- [ ] Test tool call end-to-end — verify the agent can create a poll and data persists correctly

---

## Step 3: Generative UI — Poll Components

Build the React components that render inline in the chat for poll creation and results.

- [ ] Build `PollCreationCard` component — **configuring state:** editable question, options (label + description), "Create Poll" button; **created state:** read-only summary, copy-to-clipboard share link
- [ ] Build `PollSummaryCard` component — **active state:** question, per-option vote count/percentage/voter names, bar chart, total votes, copy link + "Submit to Agent" buttons; **submitted state:** same content but read-only, "Submitted" badge, buttons hidden
- [ ] Wire `tool-createPoll` message parts in the chat message renderer — render `PollCreationCard` on `input-available`, `PollSummaryCard` on `output-available`
- [ ] Build `usePoll` SWR hook in `hooks/use-poll.ts` — fetches poll data with `refreshInterval: 5000` for live updates (same pattern as `useItinerary`)
- [ ] Build `usePolls` SWR hook in `hooks/use-polls.ts` — fetches all polls for a chat (used by the polls tab)
- [ ] Add `DataStreamHandler` listener for `data-poll-update` events — triggers SWR revalidation for both `usePoll` and `usePolls`
- [ ] Mobile-first responsive styling for all poll components

---

## Step 4: Public Poll Page

Build the guest-facing voting page.

- [ ] Create public poll route at `app/poll/[id]/page.tsx` — server component, no auth required
- [ ] Build page layout — header (trip name, destination, dates from linked itinerary), poll question, options as selectable cards (label + description)
- [ ] Build voting form — name text input, option selection (radio-style), submit button
- [ ] Build post-vote view — "Thank you" message with current results (vote counts, percentages, voter names, bar chart)
- [ ] Reuse `PollSummaryCard` (or a read-only variant) for the results display after voting
- [ ] Mobile-first responsive styling

---

## Step 5: Polls Tab

Add the third tab to the chat page with a poll list and detail view.

- [ ] Add "Polls" tab to the existing Radix tab system — tab order: Chat | Polls | Itinerary
- [ ] Keep all three tabs mounted via CSS toggle (consistent with existing Chat/Itinerary pattern)
- [ ] Build polls list view — compact cards sorted by status (active first, then submitted), each showing question, status badge, vote count
- [ ] Build polls empty state — "Create a poll by asking in the Chat"
- [ ] Build bottom sheet detail view (Radix Sheet / Dialog) — opens on poll card tap, renders the full `PollSummaryCard`
- [ ] Wire polls tab to `usePolls` hook for data fetching
- [ ] Mobile-first responsive styling

---

## Step 6: Submit to Agent Flow

Wire the submit action to inject poll results into the chat.

- [ ] Build submit UI — "Submit to Agent" button on `PollSummaryCard`, opens optional text input for trip planner's message, confirmation step
- [ ] On submit: call `PATCH /api/poll/[id]/submit` to update poll status
- [ ] Inject poll results as a user message into the chat — include question, options with vote counts/percentages, voter names, and the trip planner's optional message
- [ ] After submission: `PollSummaryCard` transitions to submitted state (badge, buttons hidden)
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
