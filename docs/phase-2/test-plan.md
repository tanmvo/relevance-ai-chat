# Test Plan — Polls Feature (Phase 2)

Comprehensive manual test checklist covering the full polls feature: create, share, vote, submit, agent acts. Work through each section in order. Check items off as you go.

**Prerequisites:**
- [ ] Dev server running (`pnpm dev`)
- [ ] Logged in as an authenticated user
- [ ] A chat exists with some conversation context (destination, dates set)

---

## 1. Poll Creation (AI Tool + Approval Flow)

### 1a. Agent suggests a poll

- [ ] Ask Alfred something that implies a decision, e.g. "I'm deciding between Hotel Sakura and Hotel Fuji. Hotel Sakura is $180/night near the station, Hotel Fuji is $120/night but further out."
- [ ] Alfred mentions that it can create a poll to help decide (does not auto-create)
- [ ] Ask Alfred to create the poll, e.g. "Sure, create a poll for that"

### 1b. PollCreationCard — configuring state (approval-requested)

- [ ] A `PollCreationCard` appears inline in the chat
- [ ] Shows the poll question (read-only)
- [ ] Shows 2-3 options with labels and descriptions (read-only)
- [ ] "Create Poll" button is visible
- [ ] "Deny" button is visible

### 1c. Deny flow

- [ ] Click "Deny" on the PollCreationCard
- [ ] Alfred acknowledges and asks how to adjust
- [ ] Ask Alfred to revise (e.g. "Add a third option: Hotel Maple for $150/night")
- [ ] A new PollCreationCard appears with the revised options

### 1d. Approve flow

- [ ] Click "Create Poll" on the PollCreationCard
- [ ] The card transitions to the **created state** (output-available)
- [ ] Shows the poll question, options summary, and a share link with a copy button
- [ ] A `PollSummaryCard` appears in Alfred's follow-up message showing live results (0 votes initially)

### 1e. Data persistence

- [ ] Refresh the page — the poll creation card and summary card still render correctly from persisted messages
- [ ] The poll appears in the Polls tab

---

## 2. Public Poll Page — Voting

Open the poll share link (e.g. `/poll/{id}`) in an **incognito/private window** (to simulate a guest with no auth).

### 2a. Page layout

- [ ] Page loads without requiring login
- [ ] Trip context header shows trip name, destination, and dates
- [ ] Poll question is displayed
- [ ] Options are shown as selectable cards with labels and descriptions
- [ ] A "Your name" text input is visible

### 2b. Validation

- [ ] Submit button is disabled when no option is selected and no name entered
- [ ] Selecting an option but leaving name empty — submit is still disabled or shows validation error
- [ ] Entering a name but selecting no option — submit is still disabled or shows validation error

### 2c. Casting a vote

- [ ] Enter a name (e.g. "Alice"), select an option, click submit
- [ ] A "Thank you" message appears with the voter's name
- [ ] Current results are shown: vote counts, percentages, voter names, bar chart
- [ ] Vote is final — no way to change it on this page

### 2d. Multiple voters

- [ ] Open the same link in another incognito window
- [ ] Vote as a different person (e.g. "Bob") for a different option
- [ ] Results update to show both voters

### 2e. Invalid poll

- [ ] Visit `/poll/invalid-uuid` — shows a 404 or error state, does not crash

---

## 3. Live Updates (SWR Polling)

### 3a. In-chat PollSummaryCard

- [ ] Keep the chat tab open on the PollSummaryCard
- [ ] Cast a vote from the public page in another window
- [ ] Within ~5 seconds, the PollSummaryCard updates to reflect the new vote (count, percentage, voter name, bar width)

### 3b. Polls tab

- [ ] Switch to the Polls tab
- [ ] Cast another vote from the public page
- [ ] The poll card in the list updates its vote count within ~5 seconds

### 3c. Bottom sheet detail

- [ ] Tap a poll card to open the bottom sheet
- [ ] Cast another vote from the public page
- [ ] The PollSummaryCard inside the sheet updates live

---

## 4. Polls Tab

### 4a. Tab system

- [ ] Three tabs are visible: Chat | Polls | Itinerary
- [ ] Switching between tabs preserves scroll position and state in each

### 4b. Empty state

- [ ] Create a new chat (no polls yet)
- [ ] Polls tab shows the empty state: "Create a poll by asking in the Chat"

### 4c. Poll list

- [ ] With at least one poll, the list shows compact cards with: question, status badge (Active/Submitted), vote count
- [ ] Active polls appear before submitted polls
- [ ] Within each group, newer polls appear first

### 4d. Poll card actions

- [ ] Active poll card shows a copy link button
- [ ] Submitted poll card does NOT show a copy link button
- [ ] Tapping anywhere on the card (not on a button) opens the bottom sheet

### 4e. Bottom sheet

- [ ] Bottom sheet opens from the bottom with the full PollSummaryCard
- [ ] Swiping down or tapping outside closes the sheet
- [ ] "Submit to Agent" button is visible for active polls inside the sheet
- [ ] "Submit to Agent" button is hidden for submitted polls

---

## 5. Submit to Agent

### 5a. Submit UI — from in-chat card

- [ ] On an active PollSummaryCard in the chat, "Submit to Agent" button is visible next to copy link
- [ ] Clicking it reveals an expandable panel: textarea + "Submit Results" / "Cancel" buttons
- [ ] Textarea placeholder: "Add context for the agent..."
- [ ] Clicking "Cancel" collapses the panel and clears the textarea
- [ ] Re-opening shows a clean empty textarea

### 5b. Submit UI — from polls tab sheet

- [ ] Open an active poll in the bottom sheet from the Polls tab
- [ ] "Submit to Agent" button is visible and works identically to the in-chat version

### 5c. Submit without optional message

- [ ] Click "Submit to Agent", then immediately click "Submit Results" (leave textarea empty)
- [ ] Button shows "Submitting..." while in progress
- [ ] A user message appears in the chat with:
  - "Poll Results: {question}"
  - Each option with vote count, percentage, and voter names
  - Total vote count
  - No extra text at the end
- [ ] View switches to the Chat tab automatically
- [ ] PollSummaryCard transitions to submitted state: "Submitted" badge, buttons hidden, reduced opacity
- [ ] Alfred responds to the poll results

### 5d. Submit with optional message

- [ ] Create a second poll, get some votes
- [ ] Click "Submit to Agent", type a message like "Let's go with the winner and add it to Day 2 afternoon"
- [ ] Submit — the user message includes both the poll results AND the typed message at the end
- [ ] Alfred's response references the context provided (e.g. "Day 2 afternoon")

### 5e. Error handling

- [ ] Try submitting with network disconnected or DevTools blocking `/api/poll/*/submit` — error toast appears, no chat message injected, poll stays active

---

## 6. Agent Processes Poll Results

### 6a. Decisive result (clear majority)

Set up a poll where one option wins clearly (e.g. 3 votes vs 1 vote). Submit with context like "Add it to Day 3 morning".

- [ ] Alfred auto-updates the itinerary using tools (addActivity, setAccommodation, etc.)
- [ ] Alfred confirms what was done
- [ ] The Itinerary tab reflects the change

### 6b. Ambiguous / tied result

Set up a poll with a tie (e.g. 2 votes vs 2 votes). Submit without additional context.

- [ ] Alfred does NOT auto-update the itinerary
- [ ] Alfred presents the tie and asks the trip planner to decide

### 6c. Insufficient context

Submit a decisive poll result without specifying where it fits (no day/time context in conversation or optional message).

- [ ] Alfred asks a follow-up question (e.g. "Which day should I add hiking to?")

---

## 7. State Transitions & Consistency

### 7a. Submitted poll — in-chat card

- [ ] PollSummaryCard shows "Submitted" badge
- [ ] "Submit to Agent" button is hidden
- [ ] Copy link button is hidden
- [ ] Card has reduced opacity

### 7b. Submitted poll — polls tab list

- [ ] Poll card shows "Submitted" badge
- [ ] Copy link button is hidden
- [ ] Poll sorts below active polls

### 7c. Submitted poll — bottom sheet

- [ ] PollSummaryCard in the sheet shows submitted state (badge, no buttons)

### 7d. Submitted poll — public page

- [ ] The public page still loads (prototype: does not block votes)

---

## 8. Public Page — No Chat Actions

- [ ] Open a poll's public page `/poll/{id}` in an incognito window
- [ ] The "Submit to Agent" button does NOT appear (only visible inside the authenticated chat)

---

## 9. Multiple Polls in One Chat

- [ ] Create 2-3 polls in the same chat
- [ ] All appear in the Polls tab, sorted correctly
- [ ] Each PollSummaryCard in the chat stream shows independent data
- [ ] Submitting one poll does not affect the others
- [ ] Voting on one poll's public page does not affect the others

---

## 10. End-to-End Walkthrough

The golden path. Do this as a final check.

- [ ] Start a new chat, set up a trip (destination, dates)
- [ ] Discuss options for an activity with Alfred
- [ ] Ask Alfred to create a poll
- [ ] Review and approve the poll (click "Create Poll")
- [ ] Copy the share link
- [ ] Open the link in 2-3 incognito windows, vote as different guests
- [ ] Watch live results update in the PollSummaryCard
- [ ] Click "Submit to Agent", add optional context, confirm
- [ ] Verify Alfred processes the results and updates the itinerary
- [ ] Check the Itinerary tab — the change is reflected
- [ ] Check the Polls tab — the poll shows as submitted

---

## Sign-Off

- [ ] All checks above pass
- Date: ___________
- Tester: ___________
- Notes: ___________
