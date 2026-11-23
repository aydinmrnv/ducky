# Decisions and open questions

A running log. Update it whenever something is decided or a new question comes up.

## Decided

### Product
- **What:** A Duolingo-style iOS app that teaches coding with AI, focused on understanding over syntax.
- **Core differentiator:** The AI is part of the exercise (spot its bug, judge its output, review its work, direct it to build), not a chatbot on the side.
- **Learning rhythm:** Every unit combines hand coding and AI-assisted coding: learn by hand, direct the AI, check the AI, fix by hand.
- **Interaction model:** Tap-first. Typing code is limited to short exercises using a custom code keyboard.
- **Correctness:** Content is grounded in real standards and verified by executing code. Never trust AI output as the answer key without verification.

### Platform
- **Native iOS only, 100% SwiftUI.** Minimum iOS 26.
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions).
- **AI:** Provider-agnostic backend interface. Default live model is the cheapest current Claude Haiku. Fallback provider (for example Gemini) allowed. Content generation uses a stronger model through the Batch API.
- **AI budget:** Owner has $100/month in Claude API credits through the Claude Max plan. Treat it as a monthly ceiling. Verify terms (rollover, commercial use) in the Claude Console.

### Brand
- **Working name:** Ducky. The duck mascot is the face of the AI. "Quack" is the mascot's signature sound used in copy.
- **The name must stay easy to change.** Bundle ID and internal names are neutral. See `02-brand.md`.

### Business
- **Pricing:** $4.99/month, $29.99/year. 14-day free trial on the annual plan.
- **Founding lifetime:** $49.99, limited to the first 500 buyers or launch week. Standard lifetime after: $89.99.
- **Generous free plan:** All core lessons free. AI exercises limited by daily Sparks. Hearts system.
- **Sparks:** In-app currency for AI-powered exercises. Earned (daily, streaks, referrals) or bought (consumable IAP).
- **Apple Small Business Program:** Enrolled (15% commission).
- **Goal:** $10k in year 1 (about 400 paying users).

### Design
- "Linear meets Duolingo": clean, grown-up, playful in small doses. Dark mode first-class. Code is the hero of every lesson screen.

## Open questions

1. **Primary target user.** Complete beginners, vibe coders who build with AI but feel lost, or students? Current leaning: AI-curious beginners and vibe coders. Affects onboarding, first unit, and marketing.
2. **End goal of the curriculum.** "Ship your own app with AI," "understand what AI writes," or "get a tech job"? Current leaning: ship your own app with AI and understand it.
3. **Languages.** Current plan: JavaScript + HTML/CSS first (web, renderable in Build Challenges), Python later. Confirm.
4. **Mascot model.** One duck with two modes (teacher in lessons, show-off who slips up in bug exercises) vs two characters. Current leaning: one duck, two modes.
5. **Final name.** Ducky is the working name. Revisit after living with it for a few weeks.
6. **Lifetime users and Sparks.** Lifetime users get the same monthly Spark allowance as subscribers. Confirm.
7. **Android.** Not planned for v1.
8. **Web version.** Not planned for v1. Revisit for school licenses.
