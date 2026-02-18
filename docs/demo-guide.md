# Demo Guide — Byron Bay Weekend Trip

> **Scenario:** You are a trip organizer planning a weekend getaway to Byron Bay for 4 adults and 4 kids. You'll walk through the full product end-to-end, from first message to sharing the itinerary with your group.

---

## 1. First Impressions

- Open the app — show the **greeting screen** and the **suggested action cards** (quick-start prompts)
- Point out the **sidebar** with chat history grouped by date (Today, Yesterday, Last Week, etc.)
- Instead of using a suggested action, type your own opening message to kick things off naturally:
  > "Hey! I'm planning a weekend trip to Byron Bay for 4 adults and 4 kids"

---

## 2. Alfred Sets Up the Trip (Phase 1 — Trip Basics)

- Alfred will ask a few targeted questions — **dates, trip name, any other context**
- Confirm the dates (e.g. a Friday–Sunday) and watch Alfred call `updateTripMetadata` in real time
- **Showcase: Tool call UI** — the collapsible "Running actions..." / "Completed N actions" indicator appears inline in the chat as Alfred writes to the itinerary behind the scenes
- **Showcase: Tab system** — switch to the **Itinerary tab** and show the **hero section** now populated with trip name, destination, dates, and guest count (4 adults, 4 kids)
- Switch back to **Chat tab** — tabs preserve scroll position

---

## 3. Getting to Know the Group (Phase 2 — Preferences)

- Alfred doesn't jump straight into planning — he asks about the group's interests first
- Answer with something like:
  > "The kids are ages 4–10, so we need kid-friendly activities. The adults love good food and want some downtime at the beach. We're not early risers."
- This sets the tone for everything Alfred suggests going forward
- **Key point to call out:** Alfred is collaborative, not autopilot — he asks before adding anything

---

## 4. Building Day 1 Incrementally (Phase 4 — Planning)

- Alfred will suggest activities for **Day 1 morning** in text first (e.g. "How about starting with a late breakfast at Folk Byron Bay, then heading to Clarkes Beach?")
- **He waits for your approval** before adding anything — say "sounds great, add those"
- Watch the tool calls fire: `addActivity` for each item
- **Showcase: Real-time itinerary updates** — switch to the Itinerary tab and the new items appear immediately under Day 1 → Morning
- **Showcase: Item cards** — each card shows the type icon (activity, meal, transport, accommodation), description, price estimate, and a **"Book now" button**
- Continue through **Day 1 afternoon and evening** — approve or tweak Alfred's suggestions
- Ask Alfred to **set accommodation** for the first night:
  > "Book us into Elements of Byron for the first night"
- Watch `setAccommodation` fire and the stay card appear under Day 1 → Night

---

## 5. Web Search for Real Info

- Ask Alfred something he'd need to look up:
  > "Are there any markets on this weekend in Byron Bay?"
- **Showcase: Web search tool** — Alfred calls `webSearch` (powered by Perplexity) and returns real, current results
- He'll incorporate findings into his suggestions (e.g. Byron Farmers Market on a Saturday morning)

---

## 6. Making Changes — Remove & Edit

- Decide you want to swap something out:
  > "Actually, remove the beach session on Day 1 afternoon — the kids will be tired"
- Watch `removeActivity` fire
- **Showcase: Edit button** on itinerary cards — click the edit icon on any item card to modify details directly from the Itinerary tab
- Ask Alfred to replace it with something else:
  > "Can we do something more relaxed, like the Crystal Castle?"

---

## 7. Adding Transport

- Mention how you're getting there:
  > "We're driving down from Gold Coast, leaving Friday morning"
- Alfred calls `setTransport` — a transport card appears on Day 1 → Morning with the car details
- Add a return trip for Sunday afternoon

---

## 8. Suggestion Picker

- As you plan Day 2, Alfred will present options using the **Suggestion Picker** — an interactive card rendered inline in the chat
- Each option shows a **lettered badge** (A, B, C…), the suggestion title, a **type tag** (Activity, Meal, Stay, Transport, Experience) colour-coded by category, plus estimated price and duration where relevant
- **Showcase: Tap to choose** — click an option and it automatically sends a message on your behalf ("I'd like [option]"), the card locks in your selection with a checkmark, and Alfred proceeds to add it to the itinerary
- This is the main way Alfred presents choices during planning — it keeps the conversation flowing without the organizer having to type out their preference

---

## 9. Creating a Poll for the Group

- You've narrowed dinner options but want the group's input:
  > "Can you create a poll for the group? We're deciding between The Balcony, No Bones, and Harvest"
- **Showcase: Approval flow** — Alfred drafts the poll and presents it as an **approval card** in the chat with the question and options
- Review the options, then click **"Create Poll"** to approve (or **"Deny"** to ask for changes)
- Once approved, the poll is created and a **"Copy share link"** button appears
- **Showcase: Polls tab** — switch to the **Polls tab** to see all polls listed, with active polls sorted first
- Click a poll card to open the **detail sheet** with full results

---

## 10. Guest Voting (Public Poll Page)

- Copy the share link and open it in a new browser tab (or incognito)
- **Showcase: Public poll page** — no login required, guests see the poll question, options with descriptions, and trip context (trip name, destination, dates)
- Cast a few votes with different names to simulate group participation
- Back in the app, check the Polls tab — vote counts update

---

## 11. Processing Poll Results

- Once voting is done, submit the poll results from the Polls tab
- Go back to the Chat tab and tell Alfred:
  > "The dinner poll results are in"
- Alfred analyzes the outcome — if there's a clear winner he auto-adds it to the itinerary; if it's a tie, he asks you to break it
- **Key point:** the full loop — create poll, share, collect votes, submit, AI processes results

---

## 12. Sharing the Final Itinerary

- Once the itinerary is looking good, switch to the **Itinerary tab** for a final review
- Show the full structure: **Hero section** (trip name, destination, dates, guests) → **Day sections** → **Time blocks** (Morning, Afternoon, Night) → **Item cards**
- **Showcase: Public itinerary link** — the itinerary has a standalone public page at `/itinerary/[id]` that requires no login
- Open it in a new tab to show the read-only view guests would see — same beautiful layout, just no editing

---

## Feature Recap (What We Built)

| Feature | What it does |
|---|---|
| **Alfred AI persona** | Concise, task-oriented trip planning assistant with phased conversation style |
| **Tab system** (Chat / Polls / Itinerary) | Three views within a single chat, tabs preserve scroll |
| **Itinerary tools** | `updateTripMetadata`, `addActivity`, `removeActivity`, `setAccommodation`, `setTransport` — all update the itinerary in real time |
| **Web search** | Live destination research via Perplexity sonar |
| **Suggestion Picker** | Interactive inline cards with type tags, price, duration — tap to choose and auto-send |
| **Polls with approval flow** | AI drafts poll → organizer approves/denies → share link → guest voting → AI processes results |
| **Public poll page** | No-auth voting page with trip context |
| **Public itinerary page** | Read-only shareable itinerary at `/itinerary/[id]` |
| **Real-time updates** | Itinerary tab refreshes instantly as AI makes changes via data stream events |
| **Tool call UI** | Collapsible progress indicator showing running/completed actions inline |
| **Item cards** | Type-aware cards (activity, meal, stay, transport) with icons, prices, "Book now", and edit |
| **Chat history** | Sidebar with date-grouped conversations, cursor-paginated |
| **Multi-model support** | Model selector in the input area |

---

## Tips for the Demo

- **Keep the chat natural** — don't rush. Let Alfred ask questions and show the back-and-forth.
- **Switch tabs often** — the real "wow" moment is seeing the itinerary build in real time as you chat.
- **Use the poll flow end-to-end** — it's the most complete collaborative feature. Have a second browser window ready for the guest voting experience.
- **Show a mistake and fix it** — removing/swapping an activity demonstrates that the organizer is always in control.
- **End on the public itinerary page** — open it on your phone if possible to show mobile-first design.
