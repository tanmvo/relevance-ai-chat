# Polls Feature: Requirements Questionnaire

> **Status:** Draft — Gathering Requirements
> **Last Updated:** 2026-02-18
> **Scope:** Prototype (Phase 2)
> **Feature:** In-app polls for trip planning consensus

---

## Overview

Add a polls feature that lets trip planners create polls inside the chat (via generative UI), share them with guests for voting, view results in real-time, and submit finalized results back to the AI agent to update the itinerary.

**This questionnaire captures the requirements needed to draft a full PRD.** Work through each section and provide your input — we'll iterate together.

---

### 1. Poll Creation Flow

- [ ] **1.1 — Trigger:** The trip planner asks the agent to create a poll. Should the agent _also_ proactively suggest creating a poll when it detects a decision point (e.g., "Should we do snorkeling or hiking on Day 3?"), or should polls only be created when the trip planner explicitly asks? I think it should suggest that it can create a poll to let the trip planner know the feature exists

- [ ] **1.2 — Poll Types:** You mentioned two types — single option (Yes/No) and multiple options. For multiple-option polls, can voters only pick one option, or should multi-select (pick N of M) be supported? Examples:
  - **Single option (Yes/No):** "Should we book the sunset cruise?" → Yes / No
  - **Multiple choice, pick one:** "Which restaurant for Day 2 dinner?" → Option A / Option B / Option C
  - **Multiple choice, pick many:** "Which activities interest you?" → Check all that apply
  - Confirm which of these you want for the prototype. = This one: - **Multiple choice, pick one:** "Which restaurant for Day 2 dinner?" → Option A / Option B / Option C

- [ ] **1.3 — Poll Context:** Should the poll automatically inherit context from the conversation (e.g., trip name, destination, relevant day/time block)? Or is the poll question standalone with no itinerary linkage? Just a standalone for now

- [ ] **1.4 — Agent-Generated Defaults:** When the trip planner asks the agent to create a poll, should the agent pre-fill the poll question and options based on conversation context? For example, if the conversation was about choosing between two hotels, should the agent auto-suggest the poll question ("Which hotel do you prefer for nights 3-5?") and options ("Hotel A — $180/night" / "Hotel B — $220/night")? Yes, I would love that option too

- [ ] **1.5 — Editing Before Creation:** Can the trip planner modify the agent's suggested question/options in the generative UI component before creating the poll? Or is it a one-shot creation? Yes, it should present the poll in its editable state before creating the poll in order for the trip planner to verify

- [ ] **1.6 — Option Limits:** Is there a max number of options for a multiple-choice poll? (e.g., 2-6 options? Unlimited?) 3 options is fine

- [ ] **1.7 — Option Descriptions:** Should options support a short description or note alongside the label? (e.g., "Hotel Sakura — $180/night, 10 min from station" vs. just "Hotel Sakura"), yes description would be great

---

### 2. Poll Creation UI (Generative UI Component)

- [ ] **2.1 — Component Placement:** The creation component renders inline in the chat via generative UI (AI SDK tool call). Confirm this is the intended placement — not a modal, sidebar, or separate page. yes

- [ ] **2.2 — Creation Form Fields:** What fields should the poll creation component include? 
  - Poll question (text input)
  - Poll type toggle (Yes/No vs. Multiple choice)
  - Options list (for multiple choice — add/remove options)
  - Anything else? (e.g., optional description, deadline, anonymous toggle)
  This is fine, see previous answers for context too

- [ ] **2.3 — Component States:** The creation component should have at least these states:
  - **Configuring** — trip planner is editing the poll before creating
  - **Created** — poll has been created, shows share link + summary
  - Any other states you envision? cAn't think of any right now

- [ ] **2.4 — Share Link:** After creation, the component should display a shareable link. Should this be a copy-to-clipboard button, or also offer other sharing methods (e.g., QR code)? For prototype, copy-to-clipboard is simplest. cpoy to clipboard is fine

---

### 3. Public Poll Page (Guest-Facing)

- [ ] **3.1 — URL Structure:** Following the existing pattern (`/itinerary/[id]`), the public poll page would be at `/poll/[id]`. Does this work, or do you prefer a different structure? Yep

- [ ] **3.2 — Page Header:** You mentioned showing trip name and dates. Should this also include the destination? Any other trip context? (For prototype, we'd pull this from the linked itinerary.) Yep

- [ ] **3.3 — Voter Identity:** You mentioned guests submit their name against the vote. Is this:
  - A simple text input (guest types their name, no account needed)?
  - Or should it tie into some guest list / contact list?
  - For prototype, a simple name input seems right. Confirm?  Simple text input

- [ ] **3.4 — Vote Modification:** Can a guest change their vote after submitting? Or is it final? If they can change, how do we identify them — by name match, browser cookie, or something else? nah, once submitted then its done

- [ ] **3.5 — Duplicate Prevention:** Any concern about duplicate votes? For prototype, should we even worry about this, or just trust the name input? nah don't worry about it for now

- [ ] **3.6 — Vote Confirmation:** After a guest submits their vote, what do they see? Options:
  - A "Thank you" message with current results visible
  - A "Thank you" message without results (results only for trip planner)
  - Redirect somewhere
  - What feels right? - A "Thank you" message with current results visible

- [ ] **3.7 — Poll Closed State:** When the trip planner submits the poll results to the agent, should the public poll page show a "This poll has been closed" state? Or remain voteable indefinitely? I don't think we should worry about this for now

---

### 4. Poll Results / Summary Component (In-Chat)

- [ ] **4.1 — Live Updates:** You mentioned the summary dynamically updates as votes come in. For prototype, the simplest approach is SWR polling (fetch results every few seconds). Is that acceptable, or do you need true real-time (WebSocket/SSE)? basic SWR polling is fine

- [ ] **4.2 — Results Display:** What should the summary component show?
  - Total votes cast 
  - Per-option vote count and/or percentage
  - Voter names per option (e.g., "Hotel A — 3 votes: Alice, Bob, Charlie")
  - Bar chart / visual breakdown
  - Confirm which of these matter for the prototype.
  All of the above would be a nice touch

- [ ] **4.3 — Summary Component States:** Based on your description, the summary component has at least:
  - **Active** — poll is open, votes are coming in, results update live
  - **Submitted** — trip planner has sent results to the agent
  - Any other states? (e.g., "Expired" if you add deadlines later) Nope

- [ ] **4.4 — Submit Action:** When the trip planner clicks "Submit to Agent" on the summary component:
  - Does this send the full results (question, options, vote counts, voter names) back into the chat as context for the agent?
  - Should it trigger automatically (agent picks it up), or should the trip planner add a message alongside the submission (e.g., "Go with Option A since it won")?
  - Or should the agent just receive the results and decide the next step on its own?
  Trip planner submits and has an option to add a message with it. They could say, lets choose option 1 and add it to day 3 evening


- [ ] **4.5 — Post-Submission Behavior:** After submitting results to the agent:
  - Can the trip planner re-open the poll? Or is it permanently closed? closed
  - Does the summary component become read-only (greyed out, "Submitted" badge)? jsut a submitted badge and hide submit/share buttons
  - Can new votes still come in on the public page, or does submitting close voting? closes


---

### 5. Polls View (New Tab / View)

- [ ] **5.1 — Placement:** You mentioned "another view within chat." This would be a third tab alongside Chat and Itinerary — is that correct? On mobile, three tabs is still manageable but worth confirming. Alternatively, it could be a section within the Itinerary tab or accessible from the sidebar. - I think another tab, Chat | Polls | Itinerary

- [ ] **5.2 — Poll List Layout:** The polls view shows a list of poll summary components. How should they be organized?
  - Chronological (newest first)?
  - By status (active first, then submitted)?
  - Grouped by day/topic?

  For a prototype, I'd go with by status, then chronological within each group:
  Active polls first (newest at top) — these are the ones that matter right now. The trip planner wants to see which polls are still collecting votes.
  Submitted polls below (newest at top) — these are done, pushed to the agent. Still visible for reference but not actionable.

- [ ] **5.3 — Empty State:** What should the polls tab show when no polls exist yet? (Similar to the itinerary empty state — "Create a poll by asking Alfred.")
  Create a poll by asking in the Chat

- [ ] **5.4 — Poll Actions from List:** From the polls view, can the trip planner:
  - Copy the share link again? Yep
  - Submit results to agent (same as from the in-chat component)? Yep
  - Delete a poll? Don't worry for now
  - Any other actions?

- [ ] **5.5 — Navigation:** When a trip planner clicks on a poll in the polls view, should it:
  - Expand/collapse in place?
  - Navigate to the chat message where the poll was created?
  - Open a detail view? 
= Open a detail view, maybe a simple bottom sheet
---

### 6. Agent Behavior After Receiving Poll Results

- [ ] **6.1 — Automatic vs. Conversational:** When the agent receives poll results, should it:
  - Automatically make itinerary changes if the context is clear (e.g., "Hotel A won the vote — updating accommodation for nights 3-5")
  - Always ask the trip planner first before making changes
  - Hybrid — auto-update if decisive (clear majority), ask if close/ambiguous 

Hybrid — auto-update if decisive (clear majority), ask if close/ambiguous 

- [ ] **6.2 — Insufficient Context:** If the poll result alone isn't enough to make an itinerary update (e.g., "Hiking won the vote" but no day/time specified), the agent should ask follow-up questions. Confirm this is the expected behavior. YEs

- [ ] **6.3 — No Clear Winner:** How should the agent handle a tie or very close vote? (e.g., present the tie to the trip planner and ask them to decide, or suggest a compromise?) Trip planner to decide

- [ ] **6.4 — Multiple Polls:** If several polls are submitted at once (or in sequence), should the agent batch the updates, or handle them one at a time? One at a time, don't over build for this I won't be testing this in the prototype

---

### 7. Data Model

- [ ] **7.1 — Poll Entity:** Proposed fields for the poll record:
  - `id` (UUID)
  - `chatId` (FK to Chat)
  - `itineraryId` (FK to Itinerary — for trip context on public page)
  - `question` (text)
  - `type` (single/multiple)
  - `status` (active/submitted/closed)
  - `createdAt`, `updatedAt`
  - Anything else? (e.g., `description`, `deadline`, `createdByMessageId`) Shold be fine

- [ ] **7.2 — PollOption Entity:** Proposed fields:
  - `id` (UUID)
  - `pollId` (FK to Poll)
  - `label` (text)
  - `description` (optional text)
  - `sortOrder` (integer)
  - Anything else? Shold be fine

- [ ] **7.3 — PollVote Entity:** Proposed fields:
  - `id` (UUID)
  - `pollOptionId` (FK to PollOption)
  - `voterName` (text — guest's self-reported name)
  - `createdAt`
  - Anything else? (e.g., `voterIdentifier` for cookie-based dedup) Shold be fine

- [ ] **7.4 — Cascade Behavior:** Deleting a chat should cascade-delete its polls, options, and votes (matching existing itinerary cascade behavior). Confirm? Yeah, but i won't be showing that feature in the prototype

---

### 8. Scope & Boundaries

- [ ] **8.1 — Prototype Scope:** Confirm the following are IN scope for this prototype:
  - Poll creation via generative UI (agent tool call)
  - Yes/No and multiple-choice poll types
  - Public poll page (no auth)
  - Poll summary component with live-ish results (SWR polling)
  - Polls tab/view listing all polls
  - Submit results to agent flow
  - Agent processes results and updates itinerary

  Yep, confirmed

- [ ] **8.2 — Out of Scope:** Confirm these are OUT of scope for prototype:
  - Poll deadlines / expiry
  - Anonymous voting
  - Authenticated guest voting (account required)
  - Duplicate vote prevention (beyond honor system)
  - Poll templates
  - Rich media in poll options (images, links)
  - Notifications when votes come in
  - Poll analytics / export

  Yep

- [ ] **8.3 — Future Considerations:** Anything you already know you'll want in a follow-up phase? (Just noting for awareness, not building now.). Nothing for now

---

## Feasibility Notes & UX Recommendations

These are observations based on your high-level description and the current codebase. No action needed — just flagging for discussion.

### Feasibility: All Clear

The proposed approach is feasible with the current tech stack:

- **Generative UI via tool calls** — The AI SDK supports this natively. You define a `createPoll` tool that returns poll data, and map `tool-createPoll` parts to your React poll components in the chat message renderer. This follows the exact same pattern as the existing itinerary tools but renders interactive UI instead of just confirming text. The tool's `execute` function creates the poll in the DB and returns the poll data for rendering.

- **Public poll page** — Follows the same pattern as `/itinerary/[id]`. Server component fetches poll + options + votes, renders with shared components. No auth required.

- **Live results** — SWR polling (refetch every 3-5s) is the simplest approach and fine for a prototype. You already use SWR for itinerary data (`use-itinerary.ts`). A `use-poll.ts` hook with `refreshInterval` gets you there with minimal code.

- **Polls tab** — Adding a third tab to the existing Radix tabs system is straightforward. The components already use CSS toggle for tab visibility (keeping all tabs mounted), so polls data stays cached.

- **Submit to agent** — This is the most interesting piece. The trip planner would trigger a message (or server action) that injects the poll results into the chat as context. The agent receives it and can make tool calls to update the itinerary. Implementation options:
  - **Option A:** Inject a system/user message with poll results, then the agent responds normally. Simplest.
  - **Option B:** Create a `submitPollResults` tool that the client triggers. More structured but adds complexity.
  - For prototype, Option A is recommended.

### UX Recommendations

1. **Three tabs on mobile.** Chat / Itinerary / Polls is manageable but getting crowded on small screens. Consider using icons instead of text labels, or a bottom navigation bar for mobile. Worth thinking about now since Phase 3+ may add more views.

2. **Poll creation confirmation.** After the agent suggests a poll, the trip planner should have a clear "Create Poll" button — not auto-create. This prevents accidental poll creation from casual conversation.

3. **Voter name UX.** If guests just type a name with no validation, you'll get "Alice", "alice", "Ali" as three different voters. For prototype this is fine, but worth noting. A simple "Enter your name" field with a cookie to remember it for repeat visits would be a nice touch.

4. **Poll context on public page.** Showing trip name + dates gives guests confidence they're on the right poll. Consider also showing the trip planner's name (e.g., "Alice's Bali Trip") so guests know who created it.

5. **Submit flow clarity.** The "Submit to Agent" action should clearly communicate that it sends the results back to the chat and may trigger itinerary changes. A confirmation dialog ("Submit poll results to Alfred? This may update the itinerary.") would prevent accidental submissions.

6. **Multiple polls for the same decision.** What if the trip planner creates a second poll about the same topic? No technical issue, but the agent should be aware of related polls when processing results. For prototype, this is probably fine to ignore.

---

## Next Steps

1. Work through the checklist above — answer as many items as you'd like per session.
2. Answers will be incorporated into a full PRD at `docs/phase-2/PRD.md`.
3. The PRD will be broken into implementation tasks at `docs/phase-2/tasks.md`.

---

*This document is a living draft. Sections will be filled in as requirements are gathered.*
