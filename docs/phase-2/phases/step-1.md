# Step 1: Data Model & API Foundation — Completion Notes

> Phase 2 Polls feature. Completed as part of the Holiday Trip Planning Assistant.

---

## Summary

Step 1 established the poll data model, database migration, CRUD queries, error handling, and API routes for the polls feature. The implementation follows existing patterns from the itinerary tables and chat/API structure.

---

## What was done

### Schema (Drizzle ORM)

Three tables in `lib/db/schema.ts`:

| Table | Key columns |
|-------|-------------|
| `poll` | id, chatId, itineraryId, question, type, status, createdAt, updatedAt |
| `pollOption` | id, pollId, label, description, sortOrder |
| `pollVote` | id, pollOptionId, voterName, createdAt |

### Migration

- **`lib/db/migrations/0011_superb_donald_blake.sql`** — creates Poll, PollOption, and PollVote tables with foreign keys

### CRUD Queries

New functions in `lib/db/queries.ts`:

| Function | Purpose |
|----------|---------|
| `createPoll` | Insert new poll with options |
| `getPollsByChatId` | Fetch all polls for a chat (with options and aggregated vote counts) |
| `getPollById` | Fetch poll by ID (with options and full vote data) |
| `submitPoll` | Set poll status to submitted |
| `castVote` | Record a vote for an option |

**Cascade deletes:** `deleteChatById` and `deleteAllChatsByUserId` now delete polls, options, and votes when a chat is deleted.

### Error Handling

Added "poll" surface to `lib/errors.ts` with error codes: `not_found`, `forbidden`, `unauthorized`, `bad_request`.

### API Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/poll?chatId=<id>` | Required | List all polls for a chat (options + vote counts) |
| `POST /api/poll` | Required | Create poll with options (validates 2–3 options, chat ownership, itinerary lookup) |
| `PATCH /api/poll/[id]/submit` | Required | Set poll status to submitted (validates ownership, prevents double-submit) |
| `GET /api/poll/[id]/public` | None | Get poll with options, full votes, trip context (tripName, destination, dates) |
| `POST /api/poll/[id]/vote` | None | Cast vote (validates option belongs to poll, rejects votes on submitted polls) |

---

## Files affected

### Created

- `app/(chat)/api/poll/route.ts`
- `app/(chat)/api/poll/[id]/submit/route.ts`
- `app/(chat)/api/poll/[id]/public/route.ts`
- `app/(chat)/api/poll/[id]/vote/route.ts`
- `lib/db/migrations/0011_superb_donald_blake.sql`

### Modified

- `lib/db/schema.ts` — added poll, pollOption, pollVote tables and types
- `lib/db/queries.ts` — added 5 poll CRUD functions, updated 2 cascade delete functions, added poll-related type exports
- `lib/errors.ts` — added "poll" surface and 4 error messages

---

## Notes

- **Confidence:** 9/10. The step was straightforward because it closely followed existing patterns from the itinerary tables and chat API.
- The public poll route returns trip context (tripName, destination, dates) from the linked itinerary for the guest-facing voting page.
- `submitPoll` validates ownership and prevents double-submit; `castVote` rejects votes on polls that are already submitted.
