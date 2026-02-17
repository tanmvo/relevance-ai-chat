# AGENTS.md

## Project Overview

This is a Next.js AI chatbot application (Chat SDK v3.1.0) built on the Vercel AI SDK. It provides a full-featured chat interface with multi-model LLM support, artifact generation, authentication, and persistent storage.

**Tech stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.6, Tailwind CSS 4, Drizzle ORM, PostgreSQL, NextAuth v5 (beta), Vercel AI SDK 6, Redis (optional).

**Package manager:** pnpm 9.12.3

## Directory Structure

```
app/                        # Next.js App Router
  (auth)/                   # Auth route group (login, register, NextAuth API)
  (chat)/                   # Chat route group (pages + API routes)
    api/chat/               # Chat streaming endpoint (POST/DELETE)
    api/chat/[id]/stream/   # Resumable stream endpoint
    api/document/           # Document CRUD
    api/files/upload/       # File upload (Vercel Blob)
    api/history/            # Chat history (cursor-paginated)
    api/suggestions/        # Writing suggestions
    api/vote/               # Message voting
    chat/[id]/              # Dynamic chat page
    actions.ts              # Server actions (title gen, visibility, etc.)
artifacts/                  # Artifact handlers by kind (code, image, text, sheet)
components/                 # React components
  ai-elements/              # AI SDK-specific UI elements
  elements/                 # Custom reusable elements
  ui/                       # shadcn/ui primitives (auto-generated, excluded from lint)
hooks/                      # Custom React hooks
lib/
  ai/                       # AI integration layer
    tools/                  # AI tool definitions (getWeather, createDocument, etc.)
    models.ts               # Available model catalog
    providers.ts            # Model provider factory
    prompts.ts              # System prompts and prompt templates
    entitlements.ts         # Rate limits per user type
  artifacts/                # Artifact handler system (server-side)
  db/                       # Database layer
    schema.ts               # Drizzle ORM schema (PostgreSQL)
    queries.ts              # All database query functions
    migrations/             # SQL migration files
    migrate.ts              # Migration runner
  editor/                   # ProseMirror editor config
  errors.ts                 # Centralized ChatSDKError class
  types.ts                  # Shared TypeScript types
  utils.ts                  # Utility functions (cn, fetcher, UUID, etc.)
  constants.ts              # Environment detection, constants
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

Uses Next.js App Router with route groups: `(auth)` for authentication pages, `(chat)` for the main application. Dynamic route `chat/[id]` loads individual chats.

### Data Flow

- **Server components** fetch initial data (messages, votes) and pass as props.
- **`useChat` hook** (AI SDK) manages chat streaming on the client.
- **SWR** handles client-side caching for chat history, artifacts, and votes.
- **Server Actions** (`actions.ts`) handle mutations (title generation, visibility updates, message deletion).
- **`DataStreamProvider`** (React Context) distributes real-time artifact updates across components.

### Database

PostgreSQL via Drizzle ORM. Schema at `lib/db/schema.ts`:

- **User** — Accounts (email/password, guest support)
- **Chat** — Conversations with visibility (public/private)
- **Message_v2** — Messages with parts-based structure (text, file, tool parts)
- **Vote_v2** — Message upvote/downvote
- **Document** — Artifacts (text, code, image, sheet) with versioning via composite PK (id + createdAt)
- **Suggestion** — AI writing suggestions tied to documents
- **Stream** — Resumable stream tracking

All queries are centralized in `lib/db/queries.ts`. Migrations live in `lib/db/migrations/`.

### Authentication

NextAuth v5 (beta) with two providers:

- **Credentials** — Email/password login
- **Guest** — Auto-created anonymous users

User types: `guest` (20 msgs/day), `regular` (50 msgs/day). Middleware in `proxy.ts` handles auth redirects and auto-guest creation.

### AI Integration

- **Vercel AI Gateway** provides unified access to Anthropic, OpenAI, Google, and xAI models.
- Models defined in `lib/ai/models.ts`; provider factory in `lib/ai/providers.ts`.
- System prompts in `lib/ai/prompts.ts` (regular, code, sheet, title, artifact update).
- Reasoning model support with extended thinking middleware.
- Tools: `getWeather` (requires approval), `createDocument`, `updateDocument`, `requestSuggestions`.

### Streaming

The chat endpoint (`api/chat/route.ts`) uses `streamText()` and `createUIMessageStream()` from the AI SDK. Resumable streams are supported via Redis — when available, streams survive page refreshes.

### Error Handling

`ChatSDKError` class in `lib/errors.ts` uses typed error codes in `{type}:{surface}` format (e.g., `rate_limit:chat`). Each surface has a visibility level (response, log, none). Use `error.toResponse()` to convert to HTTP responses.

### Styling

Tailwind CSS 4 with `@tailwindcss/postcss`. Component library is shadcn/ui (Radix UI primitives). Theming via CSS variables with light/dark mode support (`next-themes`). Fonts: Geist Sans and Geist Mono.

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

## Deployment

Primary target is Vercel. Config in `vercel.json` and `vercel-template.json`. On Vercel, AI Gateway authentication is handled automatically via OIDC tokens. For non-Vercel deployments, set `AI_GATEWAY_API_KEY`.
