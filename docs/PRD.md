# Product Requirements Document: Holiday Trip Planning Assistant

> **Status:** Final Draft
> **Last Updated:** 2026-02-17
> **Scope:** Prototype
> **Related Docs:** [Questionnaire](./drafts/questionaire.md) · [Task List](./tasks.md) · [Phase Notes](./phases/)

---

## 1. Overview

Transform the existing AI chatbot (Chat SDK v3.1.0) into a **Holiday Trip Planning Assistant** — an AI-powered tool that helps a trip organizer build a day-by-day itinerary through conversation, then share it with guests via a public link.

**This is a prototype.** The goal is to test whether the core functionality works and get a feel for how the system behaves end-to-end. We are not optimizing for production readiness, scale, or polish — we are validating the experience. Build fast, learn fast.

### 1.1 — Core Architecture

**1 chat = 1 itinerary.** Every chat automatically has an itinerary — it is created the moment the chat is created. There is no separate "create trip" step. The itinerary starts empty and is populated through conversation as the AI makes tool calls. The organizer can switch between the chat and the itinerary view at any time.

### 1.2 — Key Concepts

| Concept | Definition |
|---|---|
| **Trip Organizer** | The authenticated user who creates and manages the trip through conversation with the AI. |
| **Guest** | Anyone the organizer shares the itinerary link with. Guests can view but not edit. |
| **Itinerary** | The structured trip plan — days, time blocks, activities, accommodation, transport. One per chat, always exists. |
| **Chat** | A conversation between the organizer and the AI. Creating a chat creates an itinerary. |

---

## 2. User Experience

### 2.1 — Information Architecture

This is a **mobile-first responsive web application**. All layouts and components should be optimized for mobile viewports first, with desktop as a secondary consideration.

```
┌─────────────────────────────────────┐
│  Sidebar (past chats)               │
│  ┌───────────────────────────────┐  │
│  │  Chat Page                    │  │
│  │  ┌─────────┬────────────────┐ │  │
│  │  │  Chat   │  Itinerary     │ │  │
│  │  │  (tab)  │  (tab)         │ │  │
│  │  ├─────────┴────────────────┤ │  │
│  │  │                          │ │  │
│  │  │  Active Tab Content      │ │  │
│  │  │                          │ │  │
│  │  └──────────────────────────┘ │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Screens:**

| Screen | Description |
|---|---|
| **Chat (tab)** | The existing chat interface. Organizer converses with the AI to plan the trip. Keep current styling. |
| **Itinerary (tab)** | Rich content view of the itinerary. Card-based layout with day sections. Lives alongside the chat as a second tab. |
| **Public Itinerary** | Standalone read-only page at `/itinerary/[id]`. No auth, no chat, no sidebar. Reuses itinerary components. |
| **Sidebar** | Keep existing sidebar — provides access to past chats (trips). |

### 2.2 — Trip Creation Flow

1. User creates a new chat (existing flow).
2. An empty itinerary is automatically created and linked to the chat.
3. The chat tab shows the conversation. The itinerary tab shows an empty state.
4. The AI uses the **Ask-First** conversation style to establish foundational details: destination, travel dates, number of adults and children.
5. As the conversation progresses, the AI makes tool calls to populate the itinerary.
6. The organizer can switch between the chat and itinerary tabs at any time to see the current state.

There are no structured forms or wizards. Everything happens through natural conversation.

### 2.3 — Itinerary View

The itinerary is a **card-based layout organized by day sections**.

**Hero Section (top of itinerary):**
- Trip name
- Destination
- Travel dates
- Guest count (adults + children)

**Day Sections:**
Each day of the trip is a distinct section containing three time blocks:

| Time Block | Purpose |
|---|---|
| **Morning** | Activities, breakfast, check-out, departures |
| **Afternoon** | Activities, lunch, transit, check-in |
| **Night** | Dinner, evening activities, accommodation |

**Item Cards:**
Each item within a time block is rendered as a card containing:
- Item type indicator (activity / accommodation / transport / meal)
- Name
- Description (dummy content for prototype)
- Price (dummy content for prototype)
- Image (placeholder for prototype)

**Empty State:**
When the itinerary has no data yet, display a clear empty state that communicates: "Start chatting to build your itinerary."

### 2.4 — Guest Access

- The organizer can copy a **public shareable link** to the itinerary.
- The link points to `/itinerary/[id]` — a standalone page, no auth required.
- Guests see the same itinerary view (hero + day sections + item cards) but with **no chat, no editing, no sidebar**.
- No notifications — the organizer shares the link manually through their own channels.
- The page reflects the current state of the itinerary when loaded. No real-time sync.

---

## 3. AI Agent

### 3.1 — Persona

**"Alfred the butler."**

The AI is a concise, task-oriented planner. It is present, gentle, and kind when needed — but invisible otherwise. It does not make small talk. It does not proactively suggest unless the organizer asks. It focuses on getting the job done efficiently.

| Trait | Behavior |
|---|---|
| **Concise** | Short, direct responses. No filler. |
| **Task-oriented** | Every message moves the itinerary forward. |
| **Present when needed** | Asks clarifying questions when context is missing. Surfaces important details (dates, weather) when relevant. |
| **Invisible otherwise** | Does not volunteer suggestions unprompted. Does not recap what it just did unless asked. |
| **Gentle** | When the organizer is unsure or conflicted, the AI is patient and supportive — not pushy. |

### 3.2 — Conversation Style Lifecycle

The AI uses a **hybrid conversation style** that adapts based on the planning phase:

| Planning Phase | Style | Rationale |
|---|---|---|
| **Trip inception** (destination, dates, guest count) | **Ask-First** | Big unknowns — need foundational context before anything useful can happen. |
| **Trip shape / style direction** (relaxed vs. packed, cultural vs. adventure) | **Neutral Facilitator** | Subjective fork with cascading impact — the organizer should own this choice. |
| **Building the itinerary** (day-by-day activities, restaurants, logistics) | **Proactive Suggestions** | AI has enough context to fill in details confidently and keep momentum. |
| **Guest preference conflicts** (competing interests within the group) | **Neutral Facilitator** | No right answer — present balanced options that respect group dynamics. |
| **Budget tradeoff moments** (cost vs. experience decisions) | **Neutral Facilitator** | Value judgment the AI should not make — present tradeoffs and step back. |
| **Itinerary refinement** (swapping activities, adjusting timing, small tweaks) | **Proactive Suggestions** | Leverage chat history and trip context for quick, confident adjustments. |

**Style Definitions:**

- **Ask-First** — Gathers context through targeted questions before making suggestions. Front-loaded in the conversation to establish the foundation.
- **Neutral Facilitator** — Presents a small number of meaningfully different options with clear tradeoffs, then steps back. Used sparingly — never for low-stakes decisions.
- **Proactive Suggestions** — Leverages accumulated context to confidently suggest details, fill gaps, and keep momentum without being asked.

**Key Principles:**
- Neutral Facilitator is used in small doses. It replaces five questions with one well-framed choice.
- Proactive Suggestions are the default for detail work. Once the big decisions are made, keep things moving.
- Ask-First is front-loaded. The earlier the AI gathers context, the less it needs to ask later.
- Never use Facilitator mode on low-stakes decisions. Those are Proactive territory.

### 3.3 — Knowledge & Boundaries

| Area | Approach |
|---|---|
| **Pricing** | Dummy content for prototype. AI generates plausible placeholder prices. |
| **Places** | Specific, real place names — not generic categories. (e.g., "Meiji Shrine" not "a popular temple") |
| **Destinations** | Specific regions supported. No constraints on international vs. domestic. |
| **Weather / Season** | Factor in when making suggestions for activities or clothing. |
| **Accommodation & Transport** | AI suggests hotels, flights, car rentals alongside activities. |
| **Date coordination** | Only if the organizer explicitly asks for help. Otherwise, the organizer handles this with their group. |
| **Memory** | No cross-session memory. Each chat/trip is independent. |
| **Proactive suggestions** | Only when the organizer asks. The AI does not volunteer "you haven't planned Day 3 yet." |

---

## 4. Tools

The AI agent uses **tool calls** to make structured, surgical updates to the itinerary. Tools are granular — each targets a specific operation.

### 4.1 — How Tools Work

As established in [1.1 — Core Architecture](#11--core-architecture), every chat has an itinerary from the moment it is created. The AI populates and modifies it through **surgical tool calls** — targeted mutations that add an activity, swap a hotel, or remove a restaurant. The AI never regenerates the full itinerary.

### 4.2 — Itinerary Tools

| Tool | Description |
|---|---|
| `updateTripMetadata` | Set or update trip-level fields: trip name, destination, travel dates, number of adults, number of children. |
| `addActivity` | Add an activity to a specific day and time block (morning/afternoon/night). Includes name, description, price, image. |
| `removeActivity` | Remove an activity from a specific day and time block by ID. |
| `setAccommodation` | Set or update accommodation for a specific night or range of nights. Includes name, description, price, image. |
| `setTransport` | Set or update transport for a specific day/time block. Includes type (flight/train/car/bus), name, description, price. |

> **Note on guests:** No guest profiles or guest management tools. The itinerary stores a simple headcount (adults + children) as trip metadata.

### 4.3 — Research Tools

| Tool | Description |
|---|---|
| `webSearch` | Search the web for destination-specific information — local events, activities, seasonal highlights, restaurant recommendations, points of interest. Scoped to trip-relevant research, not general-purpose search. |

### 4.4 — Design Principles

- **Granular over flexible.** Each tool has a tight schema and a single purpose. This makes the AI more reliable and mutations more predictable.
- **Surgical over wholesale.** Each tool call targets a specific part of the itinerary rather than replacing the whole thing.
- **Chat context drives the tools.** The AI reads chat history and itinerary state to decide what to update — the organizer does not need to spell out every field.

---

## 5. Data Model

### 5.1 — Itinerary

The itinerary is the central data object. It has a **1:1 relationship with Chat** — every chat has exactly one itinerary, created automatically.

**Metadata:**

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `chatId` | UUID | Foreign key to Chat (unique, 1:1) |
| `tripName` | string | Display name for the trip |
| `destination` | string | Destination name / region |
| `startDate` | date | Trip start date |
| `endDate` | date | Trip end date |
| `adults` | integer | Number of adult guests |
| `children` | integer | Number of child guests |
| `createdAt` | timestamp | When the itinerary was created |
| `updatedAt` | timestamp | Last modification |

**Itinerary Items:**

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `itineraryId` | UUID | Foreign key to Itinerary |
| `day` | date | Which day this item belongs to |
| `timeBlock` | enum | `morning` / `afternoon` / `night` |
| `type` | enum | `activity` / `accommodation` / `transport` / `meal` |
| `name` | string | Display name |
| `description` | string | Description text |
| `price` | string | Price display (dummy for prototype) |
| `imageUrl` | string | Image URL (placeholder for prototype) |
| `sortOrder` | integer | Position within the time block |
| `createdAt` | timestamp | When the item was created |

### 5.2 — Existing Entities (No Changes)

The following existing tables are reused as-is:

- **User** — Trip organizer accounts (email/password + guest auth)
- **Chat** — Conversations, now also representing trips
- **Message_v2** — Chat messages between organizer and AI

### 5.3 — What Is Not Stored

- No guest profiles or guest list
- No budget or expense data
- No version history
- No sensitive personal data (passports, payment info)

---

## 6. Authentication & Access

| Concern | Decision |
|---|---|
| **Auth method** | Keep current: email/password + guest auth. No changes. |
| **Chat / Itinerary (tabs)** | Requires authentication (existing behavior). |
| **Public itinerary page** | No auth required. Publicly accessible via `/itinerary/[id]`. |
| **Guest accounts** | No changes to guest auth flow. |

---

## 7. Out of Scope (Prototype)

The following are explicitly **not included** in this prototype:

- Guest profiles and individual preferences
- Budget management / expense splitting
- Packing lists / checklists
- Calendar integration (Google, Apple)
- External travel API integrations (Skyscanner, Booking.com, Yelp)
- Push / email notifications
- Offline support
- PDF / Google Docs export
- Version history / undo
- Cross-session memory
- Real-time collaboration between organizer and guests

---

## 8. Future Considerations

Features noted during requirements gathering for post-prototype exploration:

| Feature | Notes |
|---|---|
| **Vector knowledge base** | AI-powered recommendations using a curated travel knowledge base. |
| **Guest preferences** | Collect dietary needs, activity interests, mobility constraints from each guest. |
| **Conflict resolution tools** | Voting, compromise suggestions when guests disagree. |
| **Budget tracking** | Per-person and group budgets, expense splitting. |
| **External APIs** | Real-time pricing, availability, booking integration. |
| **Richer collaboration** | Guest editing, commenting, co-planning. |

---

## 9. Technical Context

This prototype is built on top of an existing codebase. Key technical details for implementers:

| Aspect | Detail |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **AI SDK** | Vercel AI SDK 6 |
| **Database** | PostgreSQL via Drizzle ORM |
| **Auth** | NextAuth v5 (beta) |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Existing tools to remove/repurpose** | `getWeather`, `createDocument`, `updateDocument`, `requestSuggestions` |
| **Existing artifact types to remove** | code, image, sheet (replace with itinerary) |
| **Mobile-first** | All new components must be optimized for mobile viewports |
