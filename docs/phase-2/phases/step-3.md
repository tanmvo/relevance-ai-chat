# Step 3: Generative UI — Poll Components

**Completed:** 2026-02-18

## Summary

Built the generative UI layer for polls: SWR hooks, DataStreamHandler integration, PollCreationCard (with tool approval flow), PollSummaryCard (with live-updating bar chart), and wired everything into the chat message renderer.

## Key Decision: Tool Approval Flow

Used the AI SDK's built-in tool approval mechanism (`needsApproval: true`) instead of editable fields for the configuring state. The `createPoll` tool pauses at `approval-requested` state, showing the AI's suggested question and options as a read-only preview. The trip planner approves to create or denies to ask Alfred for different options. This leverages the existing `addToolApprovalResponse` and `sendAutomaticallyWhen` infrastructure already wired in `chat.tsx`.

## Files Created

- `components/poll/poll-creation-card.tsx` — Handles `approval-requested` (preview + approve/deny), `approval-responded` (loading/denied), `output-available` (created with share link), and `output-error` states.
- `components/poll/poll-summary-card.tsx` — Live-updating poll results with horizontal bar chart (Tailwind-based), voter names, vote counts/percentages. Active/submitted visual states.
- `components/poll/index.ts` — Barrel export.
- `hooks/use-poll.ts` — SWR hook for single poll via `/api/poll/[id]/public`, `refreshInterval: 5000`.
- `hooks/use-polls.ts` — SWR hook for all polls by chatId via `/api/poll?chatId=<id>`.

## Files Modified

- `lib/ai/tools/create-poll.ts` — Added `needsApproval: true` to the tool definition.
- `lib/types.ts` — Added `createPoll` to `ChatTools`, `"poll-update"` to `CustomUIDataTypes`.
- `components/data-stream-handler.tsx` — Added `data-poll-update` event listener that revalidates all `/api/poll*` SWR keys.
- `components/message.tsx` — Added `tool-createPoll` specific rendering before the generic `tool-*` handler. Routes to `PollCreationCard` for approval/error states, `PollSummaryCard` for `output-available` with a pollId. Un-aliased `addToolApprovalResponse` prop.
- `docs/phase-2/PRD.md` — Updated sections 2.3 and 8 to reflect tool approval flow.
- `docs/phase-2/tasks.md` — Marked all Step 3 tasks as complete with updated descriptions.

## Architecture

```
AI calls createPoll → tool pauses at approval-requested
  → PollCreationCard shows preview (question + options)
  → User clicks "Create Poll" → addToolApprovalResponse(approved: true)
  → sendAutomaticallyWhen triggers re-send to server
  → Tool executes: creates poll in DB, writes data-poll-update event
  → Part transitions to output-available → PollSummaryCard renders
  → DataStreamHandler revalidates SWR → usePoll/usePolls refresh
  → PollSummaryCard shows live vote data (5s polling)
```

## Notes

- The `PollSummaryCard` uses the public API endpoint (`/api/poll/[id]/public`) for data, which returns full vote details including voter names. This avoids duplicating an auth-required endpoint.
- Bar chart is pure Tailwind (percentage-based widths on colored divs). No charting library dependency.
- The "Submit to Agent" button on `PollSummaryCard` is a placeholder — it will be wired in Step 6.
