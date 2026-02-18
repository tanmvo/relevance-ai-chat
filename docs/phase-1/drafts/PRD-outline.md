# PRD Outline — Holiday Trip Planning Assistant

> This is the proposed structure for the PRD. Review and approve before I write the full document.

---

## Planned Sections

### 1. Overview & Scope
- Prototype — validate core experience, not production-ready
- Transform existing Chat SDK chatbot into a trip planning assistant
- Single user type: Trip Organizer

### 2. User Experience

**2.1 — Information Architecture**
- Mobile-first responsive web app
- Main screen: Chat view with 2 tabs (Chat | Itinerary)
- Sidebar: past chats (keep existing)
- Public itinerary page: standalone view-only page for guests (no auth, no chat)

**2.2 — Trip Creation Flow**
- New chat = new trip with empty itinerary
- AI guides organizer through establishing: destination, travel dates, guest count (adults/children)
- Open conversation — no structured forms

**2.3 — Itinerary View**
- Hero section: trip name, destination, dates, guest count
- Timeline layout broken down by day
- Each day split into: Morning, Afternoon, Night
- Each block contains: activities, accommodation, transport
- Placeholder images, dummy descriptions and prices for prototype
- Rich content — not a plain list

**2.4 — Guest Access**
- Public shareable link to itinerary (no auth required)
- View-only — no chat, no editing
- No notifications — organizer shares the link manually

### 3. AI Agent

**3.1 — Persona**
- "Alfred the butler" — concise, task-oriented, present when needed, invisible otherwise
- Gentle and kind but never chatty
- Does not proactively suggest unless the organizer asks

**3.2 — Conversation Style Lifecycle**
- Ask-First: trip inception (destination, dates, guests)
- Neutral Facilitator: trip style forks, preference conflicts, budget tradeoffs
- Proactive Suggestions: itinerary detail work, refinement, pre-trip prep
- (Full table from questionnaire — carried over as-is)

**3.3 — Knowledge & Boundaries**
- Dummy content for pricing (prototype)
- Weather/seasonal awareness when making suggestions
- Specific place recommendations (real names, not generic categories)
- No memory across sessions

### 4. Tools

**4.1 — `updateItinerary`**
- Surgical mutations to the itinerary object
- Handles: add/modify/remove activities, accommodation, transport
- Handles trip metadata: destination, dates, guest count (adults/children)
- 1 chat = 1 itinerary, always exists

**4.2 — `webSearch`**
- Destination-specific research: events, activities, restaurants, seasonal highlights
- Not general-purpose — scoped to trip-relevant queries

### 5. Data Model

**5.1 — Itinerary (1:1 with Chat)**
- Metadata: trip name, destination, dates, adults count, children count
- Structure: days → time blocks (morning/afternoon/night) → items
- Each item: type (activity/accommodation/transport/meal), name, description, price, image
- No versioning, no budget tracking

**5.2 — No New Entities**
- No guest profiles
- No separate trip entity — itinerary IS the trip
- Leverage existing Chat, Message, User tables from current schema

### 6. Authentication & Access
- Keep current: email/password + guest auth (no changes)
- Itinerary pages: publicly accessible, no auth required

### 7. What's Out of Scope (Prototype)
- Guest profiles and preferences
- Budget management / expense splitting
- Packing lists / checklists
- Calendar integration
- External travel API integrations (Skyscanner, Booking.com, etc.)
- Notifications (email, push)
- Offline support
- Export to PDF / Google Docs
- Version history / undo
- Cross-session memory
- Real-time collaboration

### 8. Future Considerations (Post-Prototype)
- Vector knowledge base for AI recommendations
- Guest preference collection and conflict resolution tools
- Budget tracking
- External API integrations
- Richer guest collaboration features

---

## Questions Before I Write

1. **Itinerary data model** — should `updateItinerary` be a single flexible tool (one tool, JSON payload describing the mutation), or broken into granular tools (`addActivity`, `setAccommodation`, `removeItem`, etc.)? This affects the system prompt and how reliable the AI is at making correct updates. – Granlular tools is nice

2. **Itinerary view** — you mentioned a timeline component. Should this be a vertical scrollable timeline (like a feed), or more of a card-based layout with day sections? This affects the component structure. – Card based layout with day sections

3. **Section 9 (Phasing)** — you listed "itinerary creation and updates" as MVP. Should I include the public share link in MVP scope, or is that Phase 2? – that should be public share


