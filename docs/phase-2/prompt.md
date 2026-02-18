# Agent Prompts — Polls Feature (Phase 2)

> Copy-paste the relevant prompt when starting each step.
> Each prompt is self-contained — the agent will read the docs and plan before coding.
> **Always read `@docs/phase-2/instructions.md` first** for the workflow requirements (plan, confidence score, task tracking, phase notes).

---

## Step 1: Data Model & API Foundation

```
I'm adding a polls feature to my Holiday Trip Planning Assistant.

Read these docs first:
- @docs/phase-2/instructions.md — workflow requirements (read this first)
- @AGENTS.md — project overview and architecture
- @docs/phase-2/PRD.md — full product requirements for the polls feature
- @docs/phase-2/tasks.md — the phased task list

Start working on Step 1: Data Model & API Foundation. This includes:
- Designing the poll schema (Poll, PollOption, PollVote) in Drizzle ORM
- Creating the database migration
- Building CRUD queries in lib/db/queries.ts
- Adding API routes (authenticated + public)

Follow the existing patterns in lib/db/schema.ts and lib/db/queries.ts for the itinerary tables. Create a plan for the tasks listed, then give me a confidence score.
```

---

## Step 2: AI Tool & System Prompt

```
I'm adding a polls feature to my Holiday Trip Planning Assistant.

Read these docs first:
- @docs/phase-2/instructions.md — workflow requirements (read this first)
- @AGENTS.md — project overview and architecture
- @docs/phase-2/PRD.md — full product requirements for the polls feature
- @docs/phase-2/tasks.md — the phased task list

Start working on Step 2: AI Tool & System Prompt. This includes:
- Building the createPoll tool in lib/ai/tools/create-poll.ts
- Registering it in the chat endpoint
- Updating the system prompt in lib/ai/prompts.ts with poll awareness

Follow the existing tool pattern in lib/ai/tools/add-activity.ts (factory pattern with chatId + dataStream). The tool should write a data-poll-update event to the data stream after creating the poll. Create a plan for the tasks listed, then give me a confidence score.
```

---

## Step 3: Generative UI — Poll Components

```
I'm adding a polls feature to my Holiday Trip Planning Assistant.

Read these docs first:
- @docs/phase-2/instructions.md — workflow requirements (read this first)
- @AGENTS.md — project overview and architecture
- @docs/phase-2/PRD.md — full product requirements for the polls feature
- @docs/phase-2/tasks.md — the phased task list

Start working on Step 3: Generative UI — Poll Components. This includes:
- Building PollCreationCard component (configuring + created states)
- Building PollSummaryCard component (active + submitted states, bar chart, voter names)
- Wiring tool-createPoll message parts in the chat message renderer
- Building usePoll and usePolls SWR hooks
- Adding DataStreamHandler listener for data-poll-update events

Follow the existing patterns: hooks/use-itinerary.ts for SWR hooks, components/itinerary/ for component structure, and the AI SDK generative UI pattern (part.type === 'tool-createPoll' with input-available/output-available states). All components must be mobile-first. Create a plan for the tasks listed, then give me a confidence score. I will review and then give you go ahead.
```

---

## Step 4: Public Poll Page

```
I'm adding a polls feature to my Holiday Trip Planning Assistant.

Read these docs first:
- @docs/phase-2/instructions.md — workflow requirements (read this first)
- @AGENTS.md — project overview and architecture
- @docs/phase-2/PRD.md — full product requirements for the polls feature
- @docs/phase-2/tasks.md — the phased task list

Start working on Step 4: Public Poll Page. This includes:
- Creating the public poll route at app/poll/[id]/page.tsx (server component, no auth)
- Building the page layout (trip context header, poll question, option cards)
- Building the voting form (name input, option selection, submit)
- Building the post-vote results view (reuse PollSummaryCard or a read-only variant)

Follow the existing pattern in app/(chat)/itinerary/[id]/page.tsx for the public page structure. Mobile-first. Create a plan for the tasks listed, then give me a confidence score. I will review and then give you go ahead.
```

---

## Step 5: Polls Tab

```
I'm adding a polls feature to my Holiday Trip Planning Assistant.

Read these docs first:
- @docs/phase-2/instructions.md — workflow requirements (read this first)
- @AGENTS.md — project overview and architecture
- @docs/phase-2/PRD.md — full product requirements for the polls feature
- @docs/phase-2/tasks.md — the phased task list

Start working on Step 5: Polls Tab. This includes:
- Adding "Polls" as the middle tab (Chat | Polls | Itinerary) to the existing Radix tab system
- Keeping all three tabs mounted via CSS toggle
- Building the polls list view (compact cards, sorted by status then chronological)
- Building the empty state
- Building the bottom sheet detail view (Radix Sheet) that opens on tap

Follow the existing tab pattern in components/chat.tsx and the itinerary tab implementation. Wire data to the usePolls hook from Step 3. Mobile-first. Create a plan for the tasks listed, then give me a confidence score. I will review and then give you go ahead.
```

---

## Step 6: Submit to Agent Flow

```
I'm adding a polls feature to my Holiday Trip Planning Assistant.

Read these docs first:
- @docs/phase-2/instructions.md — workflow requirements (read this first)
- @AGENTS.md — project overview and architecture
- @docs/phase-2/PRD.md — full product requirements for the polls feature
- @docs/phase-2/tasks.md — the phased task list

Start working on Step 6: Submit to Agent Flow. This includes:
- Building the submit UI on PollSummaryCard ("Submit to Agent" button, optional message input, confirmation)
- Calling PATCH /api/poll/[id]/submit to update poll status
- Injecting poll results as a user message into the chat (question, options, vote counts, voter names, optional message)
- Transitioning PollSummaryCard to submitted state after submission
- Verifying the agent processes results correctly (auto-update for decisive, follow-up for ambiguous)

The key design decision: poll results are injected as a regular user message into the chat. The agent picks it up on the next turn and uses existing itinerary tools to act on it. Create a plan for the tasks listed, then give me a confidence score. I will review and then give you go ahead.
```
