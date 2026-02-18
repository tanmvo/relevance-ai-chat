# Step 6: Submit to Agent Flow — Completion Notes

## What Was Built

Wired the "Submit to Agent" action so trip planners can send finalized poll results into the chat for the AI agent to process.

## Architecture Decision: ChatActionsContext

The `PollSummaryCard` renders in two locations — inline in chat messages and inside the Polls tab detail sheet. Both need access to `sendMessage` (from `useChat`) and `setActiveTab` (tab state setter) which live in the `Chat` component.

**Solution:** A lightweight React Context (`ChatActionsProvider`) wraps the `Tabs` content in `Chat`, exposing `sendMessage` and `setActiveTab` to any descendant. This avoids prop drilling through `Messages`, `PollsView`, `PollDetailSheet`, etc.

The context returns `null` outside the provider (e.g., on the public poll page), so `PollSummaryCard` gracefully hides the submit button when context is unavailable.

## Files Created

- `components/chat-actions-context.tsx` — `ChatActionsProvider` + `useChatActions()` hook

## Files Modified

- `components/chat.tsx` — Wraps tab content with `ChatActionsProvider`
- `components/poll/poll-summary-card.tsx` — Added submit UI + handler
- `docs/phase-2/tasks.md` — Marked Step 6 tasks complete

## Submit Flow

1. Trip planner clicks "Submit to Agent" button on `PollSummaryCard`
2. An expandable panel appears with an optional textarea and confirm/cancel buttons
3. On confirm:
   - `PATCH /api/poll/{id}/submit` marks the poll as submitted
   - Poll results are formatted as a plain-text user message (question, options with vote counts/percentages/voter names, optional trip planner message)
   - `sendMessage` injects the message into the chat
   - `setActiveTab("chat")` switches to the chat tab
   - SWR revalidation transitions the card to submitted state (badge, buttons hidden)
4. On error: toast notification, no message injected

## Poll Results Message Format

```
Poll Results: Which hotel should we book?

- Hotel Sakura: 3 votes (60%) - Alice, Bob, Charlie
- Hotel Fuji: 2 votes (40%) - Dave, Eve

Total: 5 votes

Let's go with Hotel Sakura and add it to Day 2.
```

## Remaining Tasks

- Manual verification: agent processes results correctly (auto-updates for decisive, follow-up for ambiguous)
- End-to-end test: full create → share → vote → submit → agent acts flow
