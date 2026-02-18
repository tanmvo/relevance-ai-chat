# Product Requirements Document: Polls Feature

> **Status:** Final Draft
> **Last Updated:** 2026-02-18
> **Scope:** Prototype (Phase 2)
> **Related Docs:** [Questionnaire](./drafts/questionaire.md) · [Task List](./tasks.md)

---

## 1. Overview

Add an **in-app polls feature** that lets trip planners create polls inside the chat (via generative UI), share them with guests for voting, view results in real-time, and submit finalized results back to the AI agent to update the itinerary.

**This is a prototype.** The goal is to validate the core flow: create → share → vote → submit → agent acts. We are not optimizing for scale, security, or edge cases. Build fast, learn fast.

### 1.1 — Core Architecture

**1 chat = 1 itinerary = N polls.** Polls are created within a chat conversation through AI tool calls. Each poll is a standalone entity linked to the chat — it does not carry structured itinerary context (day/timeBlock). The agent uses conversation history to infer context when processing poll results.

### 1.2 — Key Concepts

| Concept | Definition |
|---|---|
| **Poll** | A question with 2-3 options, created by the agent on behalf of the trip planner. Has a shareable public link. |
| **Poll Option** | A single choice within a poll. Has a label and optional description. |
| **Vote** | A guest's selection of one option, identified by their self-reported name. |
| **Poll Summary** | A live-updating component showing vote counts, percentages, voter names, and a bar chart. |
| **Generative UI** | React components rendered inline in the chat, driven by AI tool calls (AI SDK `tool-*` message parts). |

---

## 2. User Experience

### 2.1 — Information Architecture

The polls feature adds a **third tab** to the chat page and a **new public page** for guest voting.

```
┌─────────────────────────────────────┐
│  Sidebar (past chats)               │
│  ┌───────────────────────────────┐  │
│  │  Chat Page                    │  │
│  │  ┌────────┬───────┬─────────┐ │  │
│  │  │  Chat  │ Polls │Itinerary│ │  │
│  │  │  (tab) │ (tab) │ (tab)   │ │  │
│  │  ├────────┴───────┴─────────┤ │  │
│  │  │                          │ │  │
│  │  │  Active Tab Content      │ │  │
│  │  │                          │ │  │
│  │  └──────────────────────────┘ │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**New Screens / Views:**

| Screen | Description |
|---|---|
| **Polls (tab)** | List of all polls for the current chat, sorted by status (active first) then chronological. Trip planner can copy share links and submit results from here. |
| **Poll Detail (bottom sheet)** | Tapping a poll in the list opens a bottom sheet with the full poll summary component. |
| **Public Poll Page** | Standalone voting page at `/poll/[id]`. No auth required. Shows trip context, poll question, options, and a name input for voting. |

**Existing screens updated:**

| Screen | Change |
|---|---|
| **Chat (tab)** | Now renders generative UI components for poll creation and poll summaries inline in the message stream. |
| **Tab bar** | Adds "Polls" as the middle tab: Chat \| Polls \| Itinerary. |

### 2.2 — Poll Creation Flow

1. The trip planner asks the agent to create a poll during conversation (e.g., "Can you create a poll to decide between these two hotels?").
2. The agent may also **suggest** creating a poll when it detects a decision point — this surfaces the feature to the trip planner.
3. The agent calls the `createPoll` tool with a pre-filled question and options based on conversation context.
4. A **poll creation component** renders inline in the chat in its **configuring** state — the trip planner sees the suggested question, options (with descriptions), and can edit before confirming.
5. The trip planner clicks **"Create Poll"** to finalize.
6. The component transitions to its **created** state — shows a summary and a **copy-to-clipboard** share link.
7. The trip planner shares the link with guests through their own channels (text, email, etc.).

### 2.3 — Poll Creation Component

Renders inline in the chat as a generative UI element (AI SDK tool part). Uses the **AI SDK tool approval flow** (`needsApproval: true`) to give the trip planner a preview before the poll is created.

**Configuring State (approval-requested):**
- Poll question (read-only preview of AI's suggestion)
- Poll type indicator (multiple choice, pick one)
- Options list (2-3 options, each showing label + optional description as read-only preview)
- "Create Poll" button (approves the tool call, triggering execution)
- "Deny" button (rejects — the trip planner can ask the AI to suggest different options)

> **Design decision:** Fields are read-only in the configuring state. The `createPoll` tool uses `needsApproval: true`, which pauses execution until the user approves. Editing is handled conversationally — if the trip planner doesn't like the suggestions, they deny and ask Alfred to adjust. This leverages the existing tool approval infrastructure (`addToolApprovalResponse`, `sendAutomaticallyWhen`) already wired in the codebase.

**Created State (output-available):**
- Poll question (read-only)
- Options summary
- Share link with copy-to-clipboard button
- Visual confirmation that the poll is live

### 2.4 — Public Poll Page

Accessible at `/poll/[id]` — no authentication required.

**Page Layout:**
- **Header:** Trip name, destination, travel dates (pulled from the linked itinerary)
- **Poll section:** Question text, options displayed as selectable cards (label + description)
- **Voter input:** Simple text input for the guest's name
- **Submit button:** Casts the vote

**After Voting:**
- "Thank you" message with current results visible (vote counts, percentages, voter names per option, bar chart)
- Vote is final — no modification after submission

**Closed State:**
- Not a priority for prototype. The public page does not actively block votes after the trip planner submits results. This can be added later if needed.

### 2.5 — Poll Summary Component (In-Chat)

After a poll is created, the agent responds with a **poll summary component** rendered inline in the chat. This component shows live results.

**Active State:**
- Poll question
- Per-option vote count, percentage, and voter names (e.g., "Hotel A — 3 votes (60%): Alice, Bob, Charlie")
- Simple bar chart / visual breakdown
- Total votes cast
- Copy share link button
- **"Submit to Agent"** button

**Submitted State:**
- Same content as active, but read-only
- "Submitted" badge
- Submit and share buttons hidden
- Voting closes on the public page

**Live Updates:**
- SWR polling (refetch every 5 seconds) via a `usePoll` hook
- Consistent with the existing `useItinerary` pattern

### 2.6 — Polls Tab

The polls tab shows all polls for the current chat.

**Layout:**
- Sorted by status: **active polls first** (newest at top), then **submitted polls** (newest at top)
- Each poll shown as a compact card with: question, status badge (active/submitted), vote count
- Tapping a poll opens a **bottom sheet** with the full poll summary component

**Empty State:**
- "Create a poll by asking in the Chat"

**Actions from List:**
- Copy share link (active polls)
- Submit results to agent (active polls)

### 2.7 — Submit to Agent Flow

When the trip planner decides to submit poll results:

1. Trip planner clicks **"Submit to Agent"** on the poll summary (either in-chat or from the polls tab).
2. An optional text input appears for the trip planner to add context (e.g., "Let's go with Option A and add it to Day 3 evening").
3. On confirmation, the poll results are injected into the chat as a user message containing the full results (question, options, vote counts, voter names) plus the trip planner's optional message.
4. The agent receives this and responds:
   - **Decisive result (clear majority):** Agent auto-updates the itinerary using existing tools (`addActivity`, `setAccommodation`, etc.) and confirms.
   - **Close/ambiguous result:** Agent presents the outcome and asks the trip planner to decide.
   - **Insufficient context:** Agent asks follow-up questions (e.g., "Hiking won — which day should I add it to?").
   - **Tie:** Agent presents the tie and lets the trip planner decide.
5. The poll status transitions to **submitted**. The summary component shows a "Submitted" badge, submit/share buttons are hidden, and the public page stops accepting votes.

---

## 3. AI Agent

### 3.1 — New Tool

| Tool | Description |
|---|---|
| `createPoll` | Create a new poll with a question and 2-3 options. The agent pre-fills the question and options based on conversation context. Returns poll data for rendering the generative UI component. |

### 3.2 — Tool Schema

```
createPoll:
  question: string     — The poll question
  options: array (2-3) — Each with:
    label: string      — Option label (e.g., "Hotel Sakura")
    description: string (optional) — Additional context (e.g., "$180/night, 10 min from station")
```

The tool's `execute` function:
1. Looks up the itinerary for the current chat (for trip context on the public page).
2. Creates the Poll record with status `active`.
3. Creates PollOption records.
4. Returns the poll data (id, question, options, shareUrl) for the generative UI component to render.

### 3.3 — System Prompt Updates

Add poll awareness to the Alfred persona prompt:

- **Poll suggestion:** When the agent detects a decision point with multiple viable options (e.g., choosing between hotels, restaurants, activities), it should mention that it can create a poll to get input from other guests. It should not auto-create — always wait for the trip planner's confirmation.
- **Poll result processing:** When the agent receives submitted poll results, it should use the hybrid approach — auto-update the itinerary if the result is decisive and context is sufficient, ask follow-up questions otherwise.
- **One at a time:** Process poll results individually, not in batches.

### 3.4 — Design Principles

- **Agent suggests, trip planner confirms.** The agent can suggest creating a poll but never auto-creates one.
- **Pre-fill from context.** The agent should leverage conversation history to suggest the poll question and options, reducing effort for the trip planner.
- **Hybrid result processing.** Decisive results get auto-applied to the itinerary. Ambiguous results prompt a conversation.

---

## 4. Data Model

### 4.1 — Poll

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `chatId` | UUID | Foreign key to Chat |
| `itineraryId` | UUID | Foreign key to Itinerary (for trip context on public page) |
| `question` | text | The poll question |
| `type` | varchar | `multiple_choice` (pick one). Single type for prototype. |
| `status` | varchar | `active` / `submitted` |
| `createdAt` | timestamp | When the poll was created |
| `updatedAt` | timestamp | Last modification |

### 4.2 — PollOption

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `pollId` | UUID | Foreign key to Poll |
| `label` | text | Option display label |
| `description` | text (nullable) | Optional description / context |
| `sortOrder` | integer | Display order |

### 4.3 — PollVote

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `pollOptionId` | UUID | Foreign key to PollOption |
| `voterName` | text | Guest's self-reported name |
| `createdAt` | timestamp | When the vote was cast |

### 4.4 — Relationships

```
Chat (1) ──── (N) Poll
Poll (1) ──── (N) PollOption
PollOption (1) ──── (N) PollVote
Chat (1) ──── (1) Itinerary ←── Poll.itineraryId (for trip context)
```

### 4.5 — Cascade Behavior

Deleting a Chat cascade-deletes its Polls → PollOptions → PollVotes. This matches existing itinerary cascade behavior. Not demonstrated in prototype but structurally sound.

---

## 5. API Routes

### 5.1 — Poll Management (Authenticated)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/poll?chatId=<id>` | Get all polls for a chat (with options and vote counts). Used by the polls tab and in-chat components. |
| `POST` | `/api/poll` | Create a new poll. Called by the `createPoll` tool's execute function. |
| `PATCH` | `/api/poll/[id]/submit` | Submit poll results — sets status to `submitted`. |

### 5.2 — Public (No Auth)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/poll/[id]/public` | Get poll data with options and current votes. Used by the public poll page and SWR polling. |
| `POST` | `/api/poll/[id]/vote` | Cast a vote. Accepts `{ optionId, voterName }`. |

### 5.3 — Pages

| Route | Auth | Description |
|---|---|---|
| `/poll/[id]` | None | Public poll voting page |

---

## 6. Authentication & Access

| Concern | Decision |
|---|---|
| **Poll creation** | Requires authentication (tool call within authenticated chat). |
| **Polls tab** | Requires authentication (existing chat page auth). |
| **Submit results** | Requires authentication (trip planner action). |
| **Public poll page** | No auth required. Publicly accessible. |
| **Voting** | No auth required. Guest self-reports their name. |
| **Duplicate prevention** | None for prototype. Honor system. |

---

## 7. Out of Scope (Prototype)

- Poll deadlines / expiry
- Anonymous voting
- Authenticated guest voting (account required)
- Duplicate vote prevention (beyond honor system)
- Poll templates
- Rich media in poll options (images, links)
- Notifications when votes come in
- Poll analytics / export
- Vote modification after submission
- Multi-select polls (pick many)
- Yes/No single-option polls (deferred — multiple choice covers both use cases with 2 options)
- Poll deletion from UI
- Structured itinerary context on polls (day/timeBlock linkage)

---

## 8. Technical Context

This feature builds on the existing codebase. Key implementation notes:

| Aspect | Detail |
|---|---|
| **Generative UI** | AI SDK tool calls return data that maps to React components via `tool-createPoll` message parts. Uses the **tool approval flow** (`needsApproval: true`): `approval-requested` for the configuring preview, `output-available` for the created state. |
| **Tool approval** | The `createPoll` tool uses `needsApproval: true`. The tool pauses at `approval-requested` state, showing the AI's suggested question and options. The user approves (creating the poll) or denies (asking the AI to adjust). The existing `addToolApprovalResponse` and `sendAutomaticallyWhen` infrastructure in `chat.tsx` handles the flow. |
| **Component rendering** | Poll creation and summary components render inline in the chat message stream. The chat message renderer checks `part.type === 'tool-createPoll'` before the generic `tool-*` handler, routing to `PollCreationCard` (approval states) or `PollSummaryCard` (output-available with pollId). |
| **Live results** | SWR polling with `refreshInterval: 5000` via a `usePoll` hook. Same pattern as `useItinerary`. |
| **Tab system** | Extends existing Radix tabs. All three tabs (Chat, Polls, Itinerary) stay mounted via CSS toggle to preserve state. |
| **Submit to agent** | Poll results injected as a user message into the chat. The agent processes it in the next turn using existing itinerary tools. |
| **Tool pattern** | Follows existing factory pattern: `createPoll({ chatId, dataStream })` returns a `tool()`. The execute function writes to the DB and streams a `data-poll-update` event via `dataStream.write()`. |
| **Public page** | Server component at `/poll/[id]`, same pattern as `/itinerary/[id]`. Fetches poll + options + votes, renders with shared components. |
| **Bottom sheet** | For the polls tab detail view. Can use a simple Radix Dialog or Sheet primitive from shadcn/ui. |
