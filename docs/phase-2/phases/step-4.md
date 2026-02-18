# Step 4: Public Poll Page

**Completed:** 2026-02-18

## Summary

Built the guest-facing public poll page at `/poll/[id]`. Server component fetches poll data and trip context, then delegates to a client component that handles the full voting experience: option selection, name input, vote submission, and live-updating results.

## Files Created

- `app/poll/[id]/layout.tsx` — Shared layout with sticky header ("Trip Planner" branding + "Plan your own trip" CTA). Same pattern as the public itinerary layout.
- `app/poll/[id]/page.tsx` — Server component. Fetches poll via `getPollById`, trip context via `getItineraryById`. Generates dynamic metadata from the poll question. Returns `notFound()` for missing polls.
- `components/poll/public-poll-page.tsx` — Client component with three view states:
  - **Voting form:** Radio-style option cards (letter indices, selection ring, label + description), name input, submit button with validation and loading state.
  - **Post-vote results:** "Thank you" banner with voter name, horizontal bar chart with vote counts/percentages/voter names, live-updating via `usePoll` (5s SWR refresh).
  - **Closed state:** "This poll has been closed" banner with final results (read-only).

## Files Modified

- `components/poll/index.ts` — Added `PublicPollPage` export.
- `docs/phase-2/tasks.md` — Marked all Step 4 tasks as complete.

## Architecture

```
/poll/[id] (no auth)
├── layout.tsx (server) — header + container
└── page.tsx (server) — fetch poll + trip context, validate, generate metadata
    └── PublicPollPage (client) — usePoll(pollId) for live data
        ├── TripContextHeader — trip name, destination, dates
        ├── Poll question + subtitle
        ├── VotingForm (pre-vote) — OptionCards + name input + submit
        ├── PostVoteResults (post-vote) — thank you + PollResults
        └── ClosedState (submitted) — lock icon + PollResults
```

## Key Decisions

- **Server component for initial fetch, client component for interactivity.** The server component handles data validation and metadata generation. The client component uses the `usePoll` SWR hook for live-updating data after voting.
- **Read-only results view instead of reusing PollSummaryCard directly.** The PollSummaryCard includes action buttons (copy link, submit to agent) and internal SWR state that don't apply to the public page. Built a standalone `PollResults` component using the same OptionBar visual pattern for consistency.
- **Client-side validation.** Name and option selection are validated before submission. The API also validates server-side (optionId, voterName required, poll not submitted).
- **Race condition handling.** If a poll is submitted (closed) while a guest has the form open, the API returns a "poll is closed" error, which is displayed to the user. On the next SWR refresh, the UI transitions to the closed state automatically.
