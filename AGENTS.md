# AGENTS.md

## Project Overview

This is a **Holiday Trip Planning Assistant** — an AI-powered tool that helps a trip organizer build a day-by-day itinerary through conversation, then share it with guests via a public link. Built on top of the Vercel AI SDK Chat SDK v3.1.0 (Next.js).

**Core concept:** 1 chat = 1 itinerary. Every chat automatically has an itinerary created the moment the chat is created. The organizer converses with the AI ("Alfred" persona) to populate the itinerary, then switches between the chat and itinerary tabs to review. Guests receive a read-only public link.

**Tech stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.6, Tailwind CSS 4, Drizzle ORM, PostgreSQL, NextAuth v5 (beta), Vercel AI SDK 6, Redis (optional).

**Package manager:** pnpm 9.12.3

**Documentation:** See `docs/phase-1/` for the full PRD, phased task list, and phase completion notes.

## Directory Structure

```
app/                        # Next.js App Router
  (auth)/                   # Auth route group (login, register, NextAuth API)
  (chat)/                   # Chat route group (pages + API routes)
    api/chat/               # Chat streaming endpoint (POST/DELETE)
    api/chat/[id]/stream/   # Resumable stream endpoint
    api/itinerary/          # Itinerary API (GET by chatId, requires auth)
    api/files/upload/       # File upload (Vercel Blob)
    api/history/            # Chat history (cursor-paginated)
    api/vote/               # Message voting
    chat/[id]/              # Dynamic chat page
    actions.ts              # Server actions (title gen, visibility, etc.)
  itinerary/[id]/           # Public itinerary page (no auth required)
components/                 # React components
  ai-elements/              # AI SDK-specific UI elements
  elements/                 # Custom reusable elements
  itinerary/                # Itinerary UI components
    itinerary-view.tsx      # Top-level: loading, empty state, hero + day sections
    itinerary-content.tsx   # Content layout wrapper
    hero-section.tsx        # Trip name, destination, dates, guest count
    day-section.tsx         # Day header + three time block sections
    time-block-section.tsx  # Morning/Afternoon/Night label + item cards
    item-card.tsx           # Activity/accommodation/transport/meal card
    empty-state.tsx         # "Start chatting to build your itinerary" message
    index.ts                # Barrel export
  ui/                       # shadcn/ui primitives (auto-generated, excluded from lint)
hooks/                      # Custom React hooks
  use-itinerary.ts          # SWR hook for itinerary data fetching
lib/
  ai/                       # AI integration layer
    tools/                  # AI tool definitions (trip planning tools)
      update-trip-metadata.ts  # Set destination, dates, trip name, guest count
      add-activity.ts          # Add activity/meal to a day + time block
      remove-activity.ts       # Remove item by name (with optional day/timeBlock)
      set-accommodation.ts     # Upsert accommodation for a night
      set-transport.ts         # Upsert transport for a day/timeBlock
      web-search.ts            # Destination-scoped web search via Perplexity sonar
    models.ts               # Available model catalog
    providers.ts            # Model provider factory
    prompts.ts              # Alfred persona prompt, conversation style lifecycle
    entitlements.ts         # Rate limits per user type
  db/                       # Database layer
    schema.ts               # Drizzle ORM schema (PostgreSQL)
    queries.ts              # All database query functions (including itinerary CRUD)
    migrations/             # SQL migration files
    migrate.ts              # Migration runner
  editor/                   # ProseMirror editor config
  errors.ts                 # Centralized ChatSDKError class
  types.ts                  # Shared TypeScript types
  utils.ts                  # Utility functions (cn, fetcher, UUID, etc.)
  constants.ts              # Environment detection, constants
docs/phase-1/              # Project documentation
  PRD.md                    # Full product requirements document
  tasks.md                  # Phased task list with completion status
  phases/                   # Phase completion notes (phase-1, phase-2, phase-3)
tests/                      # Playwright E2E tests
  e2e/                      # Test specs
  pages/                    # Page object models
proxy.ts                    # Next.js middleware (auth redirects, guest login)
instrumentation.ts          # OpenTelemetry setup (@vercel/otel)
```

## Key Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Run DB migrations then build |
| `pnpm start` | Start production server |
| `pnpm lint` | Lint with Ultracite (Biome) |
| `pnpm format` | Auto-fix with Ultracite |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:generate` | Generate migration from schema changes |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm test` | Run Playwright E2E tests |

## Environment Variables

Defined in `.env.example`:

- `AUTH_SECRET` — NextAuth session secret
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway key (non-Vercel deployments only)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage token
- `POSTGRES_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string (optional; enables resumable streams)

## Architecture & Patterns

### Routing

Uses Next.js App Router with route groups: `(auth)` for authentication pages, `(chat)` for the main application. Dynamic route `chat/[id]` loads individual chats with a tab system (Chat | Itinerary). Public itinerary at `/itinerary/[id]` is a standalone page requiring no auth.

### Data Flow

- **Server components** fetch initial data (messages, votes) and pass as props.
- **`useChat` hook** (AI SDK) manages chat streaming on the client.
- **SWR** handles client-side caching for chat history, itinerary data, and votes.
- **Server Actions** (`actions.ts`) handle mutations (title generation, visibility updates, message deletion).
- **`DataStreamProvider`** (React Context) distributes real-time updates across components.
- **`DataStreamHandler`** listens for `data-itinerary-update` events from tool calls and triggers SWR revalidation to refresh the itinerary tab in real time.

### Database

PostgreSQL via Drizzle ORM. Schema at `lib/db/schema.ts`:

- **User** — Accounts (email/password, guest support)
- **Chat** — Conversations with visibility (public/private). Each chat represents a trip.
- **Message_v2** — Messages with parts-based structure (text, file, tool parts)
- **Vote_v2** — Message upvote/downvote
- **Itinerary** — Trip metadata (tripName, destination, startDate, endDate, adults, children). 1:1 with Chat via unique `chatId` FK. Auto-created when a chat is created.
- **ItineraryItem** — Items within an itinerary (activities, accommodation, transport, meals). FK to Itinerary. Organized by `day`, `timeBlock` (morning/afternoon/night), and `sortOrder`.
- **Document** — Legacy table, kept but unused (no destructive migration)
- **Suggestion** — Legacy table, kept but unused
- **Stream** — Resumable stream tracking

Itinerary CRUD queries in `lib/db/queries.ts`: `createItinerary`, `getItineraryByChatId`, `getItineraryById`, `updateItineraryMetadata`, `addItineraryItem`, `removeItineraryItem`, `updateItineraryItem`, `getItineraryItemsByItineraryId`, `setAccommodation` (upsert), `setTransport` (upsert). Cascade deletes: deleting a chat removes its itinerary and items.

### Authentication

NextAuth v5 (beta) with two providers:

- **Credentials** — Email/password login
- **Guest** — Auto-created anonymous users

User types: `guest` (20 msgs/day), `regular` (50 msgs/day). Middleware in `proxy.ts` handles auth redirects and auto-guest creation.

### AI Integration

- **Persona:** "Alfred the butler" — concise, task-oriented trip planning assistant. Adapts conversation style based on planning phase (Ask-First → Neutral Facilitator → Proactive Suggestions).
- **Vercel AI Gateway** provides unified access to Anthropic, OpenAI, Google, and xAI models.
- Models defined in `lib/ai/models.ts`; provider factory in `lib/ai/providers.ts`.
- System prompts in `lib/ai/prompts.ts` (Alfred persona, conversation style lifecycle, tool usage instructions, trip-oriented title generation).
- Reasoning model support with extended thinking middleware.
- **Itinerary tools** (factory pattern, each receives `{ chatId, dataStream }`): `updateTripMetadata`, `addActivity`, `removeActivity`, `setAccommodation`, `setTransport`. All write `data-itinerary-update` events to the data stream after mutating the DB.
- **Web search tool:** `webSearch` — custom tool using Perplexity `sonar` model via `gateway("perplexity/sonar")` for destination-scoped research.
- **Important:** All tools must have a local `execute` function for multi-step to work. Provider-executed tools (e.g., `gateway.tools.*`) won't trigger follow-up steps.

### Itinerary UI

Tab system in `components/chat.tsx` using Radix `@radix-ui/react-tabs`. Both Chat and Itinerary tabs stay mounted (CSS toggle) to preserve scroll position.

**Component hierarchy:**

```
ItineraryView (hooks/use-itinerary.ts for data)
├── ItinerarySkeleton (loading)
├── ItineraryEmptyState (no data)
├── HeroSection (trip name, destination, dates, guest count)
└── DaySection[] (one per day in date range)
    └── TimeBlockSection[] (morning, afternoon, night)
        └── ItineraryItemCard[] (activity, accommodation, transport, meal)
```

Display components (`HeroSection`, `DaySection`, `TimeBlockSection`, `ItineraryItemCard`) are reusable — they accept data as props. The public itinerary page reuses them.

### Streaming

The chat endpoint (`api/chat/route.ts`) uses `streamText()` and `createUIMessageStream()` from the AI SDK. After `dataStream.merge()`, `await result.steps` keeps the stream alive through multi-step tool call flows. Resumable streams are supported via Redis.

### Error Handling

`ChatSDKError` class in `lib/errors.ts` uses typed error codes in `{type}:{surface}` format (e.g., `rate_limit:chat`). Each surface has a visibility level (response, log, none). Use `error.toResponse()` to convert to HTTP responses.

### Styling

Tailwind CSS 4 with `@tailwindcss/postcss`. Component library is shadcn/ui (Radix UI primitives). Theming via CSS variables with light/dark mode support (`next-themes`). Fonts: Geist Sans and Geist Mono. **Mobile-first** — all itinerary components are optimized for mobile viewports.

## Code Quality

- **Linter/Formatter:** Ultracite (Biome-based). Config at `biome.jsonc`.
- **TypeScript:** Strict mode enabled. Path alias `@/*` maps to project root.
- **Excluded from lint:** `components/ui/` (auto-generated shadcn), `lib/utils.ts`.
- **Validation:** Zod schemas for API request validation.
- **Server-only:** Sensitive modules use `server-only` import guard.

## Testing

Playwright E2E tests in `tests/`. Page object models in `tests/pages/`. Tests cover auth flows, chat interactions, model selection, and API endpoints. The test config auto-starts the dev server before running.

## Conventions

- Use `for...of` instead of `Array.forEach`.
- Use `===`/`!==` for comparisons.
- Prefer `const`; never use `var`.
- Use arrow functions over function expressions.
- No TypeScript enums — use `as const` objects instead.
- No `any` types. No non-null assertions (`!`).
- Use `import type` / `export type` for type-only imports/exports.
- Don't use `console` (except in error handlers via `ChatSDKError`).
- All accessibility rules enforced (see `.cursor/rules/ultracite.mdc` for full list).
- Never commit `.env` files or hardcode secrets.

## Removed / Legacy

The following were removed or replaced during the trip planner transformation (Phases 1-4):

- **Removed tools:** `getWeather`, `createDocument`, `updateDocument`, `requestSuggestions`
- **Removed artifacts:** Code, image, sheet artifact handlers and the entire `artifacts/` directory
- **Removed routes:** `api/document/`, `api/suggestions/`
- **Removed components:** `artifact.tsx`, `artifact-actions.tsx`, `artifact-close-button.tsx`, `artifact-messages.tsx`, `create-artifact.tsx`, `toolbar.tsx`, `version-footer.tsx`, `document.tsx`, `document-preview.tsx`, `document-skeleton.tsx`, `suggestion.tsx`
- **Legacy tables kept:** `document` and `suggestion` tables remain in the schema (no destructive migration) but no query functions reference them
- **Legacy stubs:** `lib/artifact-types.ts`, `hooks/use-artifact.ts`, `lib/ai/providers.ts` (`getArtifactModel()`) — not blocking, can be cleaned up

## Deployment

Primary target is Vercel. Config in `vercel.json` and `vercel-template.json`. On Vercel, AI Gateway authentication is handled automatically via OIDC tokens. For non-Vercel deployments, set `AI_GATEWAY_API_KEY`.
