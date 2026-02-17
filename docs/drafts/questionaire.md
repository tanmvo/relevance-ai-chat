# Product Requirements Document: Holiday Trip Planning Assistant

> **Status:** Draft — Gathering Requirements
> **Last Updated:** 2026-02-17
> **Scope:** Prototype

---

## Overview

Transform the existing AI chatbot (Chat SDK v3.1.0) into a dedicated **Holiday Trip Planning Assistant** that supports planning trips with multiple guests.

**This is a prototype.** The goal is to test whether the core functionality works and get a feel for how the system behaves end-to-end. We're not optimizing for production readiness, scale, or polish — we're validating the experience. Build fast, learn fast.

---

## Requirements Gathering Task List

The following topics need your input before we can finalize this PRD. Work through each section and provide your vision — we'll iterate together.

---

### 1. Core User Experience

- [X] **1.1 — User Personas:** Who are the primary users? (e.g., trip organizer, invited guests, both?) - Just a trip organizer for now. How I picture this MVP experience is that the trip organiser will be in charge of creating the itinerary with this AI chatbot. The itinerary will be a shareable link with other guests on the trip that they can visit at any time to view details. 
- [X] **1.2 — Onboarding Flow:** How should a new user first interact with the assistant? (e.g., guided wizard, open conversation, template selection?) I want to keep it an open conversation for now. But I want the initial stages of the conversation to be establishing key details of the trip: The destination, the travelling periods, the number of guests. We can try to infer these key details from the conversation alone, but it would be helpful for us to guide the trip planner through this journey.
- [X] **1.3 — Trip Creation:** How does a trip get started? (e.g., user says "plan a trip to Japan", structured form, or hybrid?) - You create a chat in this application and that creates a single itinerary. The Trip Planner and the Agent will collaborate together on the itinerary.
- [x] **1.4 — Conversation Style:** Hybrid approach — the AI adapts its style based on the planning phase and decision type. See [Conversation Style Lifecycle](#conversation-style-lifecycle) below for full breakdown.
- [X] **1.5 — Key Screens / Views:** What are the main screens or views you envision beyond the chat? (e.g., trip dashboard, itinerary timeline, guest list, budget tracker?) – This will be primarily a mobile web application. I see a single main screen being the chat. Within the chat you have 2 tabs, the chat itself and the Itinerary view. The chat will use the same current styling as the chat of this codebase (will edit this later). The itinerary will be a rich content page, with activities, hotels, transport listed with images (i guess for mvp just use placeholders for now), descriptions (dummy content), prices (dummy content) sitting in a timeline component, separated by days. The itinerary will have a hero section, containing a summary of the trip including the trip name, number of guests, destination and date. I would also like to keep the current sidebar component to have access to past chats.


---

### 2. Multi-Guest Collaboration

- [ ] **2.1 — Invitation Model:** How do guests get invited? (e.g., link sharing, email invite, in-app invite?) - Guests can access the itinerary only. This should just be a simple page. with no chat functionality or access
- [ ] **2.2 — Guest Roles & Permissions:** What can guests do vs. the trip organizer? (e.g., view-only, suggest edits, co-plan equally?) Guests can view the itinerary for now. We will add additional features later.
- [ ] **2.3 — Real-Time Collaboration:** Should guests see changes in real-time? Or is async (notifications/updates) sufficient? They can just click on the link when they are ready to preview.
- [ ] **2.4 — Guest Preferences:** Should the AI collect individual preferences from each guest? (e.g., dietary needs, budget range, activity interests, mobility constraints?) No, not yet
- [ ] **2.5 — Conflict Resolution:** How should the AI handle conflicting preferences between guests? (e.g., voting, organizer decides, AI suggests compromise?) Trip planner will decide that, we will build some tools later on to help that

---

### 3. Trip Planning Features

- [ ] **3.1 — Itinerary Generation:** What level of detail should the AI produce? (e.g., day-by-day schedule, hourly blocks, flexible suggestions?) - Day by Day, days broken down into, Morning, Afternoon, Night
- [ ] **3.2 — Destination Support:** Any constraints on destinations? (e.g., international only, domestic, both? Specific regions?) Specific Regions is Good 
- [ ] **3.3 — Budget Management:** Should the system track budgets? (e.g., per-person, group total, expense splitting?) No, but we can introduce this later.
- [ ] **3.4 — Accommodation & Transport:** Should the AI suggest hotels, flights, car rentals? Or just plan activities? Yes
- [ ] **3.5 — Activity & Restaurant Recommendations:** Should the AI recommend specific places, or general categories? Specific Places, I'll also add a vector knowledge base that the AI can use as a feature later
- [ ] **3.6 — Date & Availability Coordination:** Should the system help find dates that work for all guests? If the The Trip Planner has specifically asked for suggestions then yes, otherwise they will organise this with their group. But it is the AI assistants job to surface these details. in the chat and set the context.
- [ ] **3.7 — Packing Lists / Checklists:** Should the AI generate packing lists or pre-trip checklists? No
- [ ] **3.8 — Weather & Seasonal Awareness:** Should the AI factor in weather/season for the destination and dates? If making suggestions then yes.

---

### 4. AI Agent Behavior & Directives

- [ ] **4.1 — System Prompt / Persona:** What personality should the AI have? (e.g., friendly travel expert, concise planner, enthusiastic guide?) Concise planner, it should be task orientated. it should be present, gentle and kind when needed but invisible otherwise. Like Alfred the butler.
- [x] **4.2 — Tool Usage:** For MVP — itinerary management and web search. Surgical, targeted updates only. See [AI Tool Design](#ai-tool-design) below. 
- [ ] **4.3 — Knowledge Boundaries:** What should the AI know vs. not know? (e.g., should it have real-time pricing? Or work with estimates?) We can let AI come up with dummy content for now. in terms of pricing.
- [x] **4.4 — Artifact Types:** One artifact type for MVP — the itinerary. See [AI Tool Design](#ai-tool-design).
- [ ] **4.5 — Proactive Behavior:** Should the AI proactively suggest things? (e.g., "You haven't planned Day 3 yet" or "Rain is expected — here's an indoor alternative")? Unless suggested otherwise by the trip planner, no it shouldn't suggest. 
- [ ] **4.6 — Memory & Context:** Should the AI remember past trips or user preferences across sessions? No

---

### 5. Data Model & Storage

- [ ] **5.1 — Trip Entity:** What data defines a trip? (e.g., destination, dates, guests, budget, status?) Destination, Dates, Guests (Adults & Children)
- [ ] **5.2 — Guest Profiles:** What info is stored per guest? (e.g., name, preferences, dietary needs, passport info?), No guest profiles
- [ ] **5.3 — Itinerary Structure:** How should itinerary data be modeled? (e.g., days > time blocks > activities?) Days, Based on dates. 
- [ ] **5.4 — Versioning:** Should trip plans support version history / undo? No
- [ ] **5.5 — Data Privacy:** Any sensitivity concerns? (e.g., passport numbers, payment info — store or not?) No

---

### 6. Authentication & Access

- [ ] **6.1 — Auth Changes:** Keep current email/password + guest auth? Or add social login (Google, Apple)? Keep current
- [ ] **6.2 — Guest Access Without Account:** Can invited guests view/interact without creating an account? They can view the itinerary. Make it publicly available
- [ ] **6.3 — Trip Visibility:** Public shareable trips vs. private only? Just make it public, its only a prototype

---

### 7. Integrations & APIs

- [ ] **7.1 — External APIs:** Any specific travel APIs to integrate? (e.g., Google Maps, Skyscanner, Booking.com, Yelp, OpenWeather?) No
- [ ] **7.2 — Calendar Integration:** Should trips sync to Google Calendar, Apple Calendar, etc.? No
- [ ] **7.3 — Export Options:** Should users be able to export itineraries? (e.g., PDF, Google Docs, share link?) Share link
- [ ] **7.4 — Notifications:** How should guests be notified of updates? (e.g., email, push, in-app?) None, Trip Planner will update

---

### 8. Non-Functional Requirements

- [ ] **8.1 — Performance Targets:** Any latency or response-time expectations for the AI? No
- [ ] **8.2 — Scale:** Expected number of users, concurrent trips, guests per trip? 1 or 2 users, just a prototype
- [ ] **8.3 — Mobile Support:** Mobile-first, responsive web, or native app later? Mobile first, everything should be optimised for mobile
- [ ] **8.4 — Offline Support:** Any need for offline access to itineraries? No

---

### 9. Phasing & Priorities

- [ ] **9.1 — MVP Scope:** What's the absolute minimum for a first working version? Itinerary creation and updates.
- [ ] **9.2 — Phase 2 Features:** What can wait for a second release?
- [ ] **9.3 — Out of Scope:** Anything explicitly out of scope?

---

## Conversation Style Lifecycle

The AI assistant uses a **hybrid conversation style** that adapts based on the planning phase and the nature of the decision. Three styles are blended throughout the experience:

### Style Definitions

**Ask-First** — The AI gathers context through targeted questions before making suggestions. Best for big decisions where the AI lacks enough information to be useful without input.

**Neutral Facilitator** — The AI presents a small number of meaningfully different options with clear tradeoffs, then steps back and lets the organizer (or group) decide. Used sparingly to avoid decision fatigue — reserved for subjective forks where there's no objectively "right" answer.

**Proactive Suggestions** — The AI leverages accumulated context from chat history and trip metadata to confidently suggest details, fill in gaps, and anticipate needs without being asked.

### When Each Style Is Used

| Planning Phase | Style | Rationale |
|---|---|---|
| **Trip inception** (destination, dates, guest count, budget) | Ask-First | Big unknowns — need foundational context before anything useful can happen |
| **Trip shape / style direction** (relaxed vs. packed, cultural vs. adventure) | Neutral Facilitator | Subjective fork with cascading impact — the group should own this choice |
| **Building the itinerary** (day-by-day activities, restaurants, logistics) | Proactive Suggestions | AI has enough context to fill in details confidently and keep momentum |
| **Guest preference conflicts** (competing interests within the group) | Neutral Facilitator | No right answer — present balanced options that respect group dynamics |
| **Budget tradeoff moments** (cost vs. experience decisions) | Neutral Facilitator | Value judgment the AI shouldn't make — present tradeoffs and step back |
| **Itinerary refinement** (swapping activities, adjusting timing, small tweaks) | Proactive Suggestions | Leverage chat history and trip context for quick, confident adjustments |
| **Pre-trip prep** (packing lists, weather alerts, reminders, checklists) | Proactive Suggestions | AI knows the full trip — anticipate needs and surface them at the right time |

### Key Principles

- **Neutral Facilitator is used in small doses.** It replaces five questions with one well-framed choice. It should never feel like a quiz.
- **Proactive Suggestions are the default for detail work.** Once the big decisions are made, the AI should keep things moving — not ask permission for every restaurant pick.
- **Ask-First is front-loaded.** The earlier the AI gathers the right context, the less it needs to ask later.
- **The AI should never use Facilitator mode on low-stakes decisions** (e.g., "which café for breakfast"). Those are Proactive territory — pick one confidently, move on.

---

## AI Tool Design

The AI agent uses **tool calls** to make structured, surgical updates to trip data. For MVP, tools are scoped to two groups: **itinerary management** and **guest management**.

### Core Architecture

- **1 chat = 1 itinerary.** Every chat automatically has an itinerary object. No tool call needed to "create" it — it exists from the moment the chat is created.
- **Empty state by default.** A new chat starts with an empty conversation on the left and an empty itinerary view on the right. The itinerary populates as the AI and organizer collaborate.
- **Surgical updates via tool calls.** The AI never regenerates the full itinerary. It makes targeted mutations — add an activity to Day 2, swap a hotel for nights 3-5, remove a restaurant from Day 4 lunch. This keeps the organizer in control and changes auditable.

### MVP Tool Groups

**Itinerary Tools**

| Tool | Description |
|---|---|
| `updateItinerary` | Add, modify, or remove items in the itinerary (activities, meals, transport, accommodation, notes). Also handles trip metadata like guest count (adults/children), destination, and dates. |

> **Note on guests:** No individual guest profiles or guest management tools for MVP. The itinerary stores a simple headcount — number of adults and number of children. This is metadata on the itinerary itself, not a separate entity.

**Research Tools**

| Tool | Description |
|---|---|
| `webSearch` | Search the web for destination-specific information — local events, activities, seasonal highlights, restaurant recommendations, points of interest. Not a general-purpose search engine; scoped to trip-relevant research that feeds into itinerary decisions. |

### Design Principles

- **Keep it tight.** Two tool domains — itinerary management and destination research. No calendar sync, booking, or export tools in MVP.
- **Surgical over wholesale.** Each tool call targets a specific part of the itinerary rather than replacing the whole thing. This makes changes predictable and reversible.
- **Chat context drives the tools.** The AI reads chat history and itinerary state to decide what to update — the organizer doesn't need to spell out every field.

---

## Next Steps

1. Work through the task list above — answer as many items as you'd like per session.
2. I'll incorporate your answers into the full PRD with detailed specs.
3. Once finalized, we'll break the PRD into implementation tasks.

---

*This document is a living draft. Sections will be filled in as requirements are gathered.*
