# Roadmap

Owner works 5 to 8 hours a week. Milestones are sized for that. Build the smallest complete vertical slice first, then widen.

## Phase 0: Validate (weeks 1 to 2, parallel with Phase 1)
- Post 10 to 15 faceless puzzle videos ("Spot the bug", "What does this print?") on TikTok, Shorts, Reels. See `16-marketing.md`.
- Simple waitlist landing page.
- Signal to continue: a few hundred waitlist signups, or posts with strong engagement and comments asking for more.
- Spend an hour each in Coddy, Mimo, and Brilliant. Write down what's annoying or missing.
- Reserve the app name in App Store Connect. Grab social handles.

## Phase 1: Foundations (weeks 1 to 3)
**M1. Project setup**
- Xcode project with neutral names, `LearnKit` package, design system tokens, `Brand` constants.
- Supabase dev project: auth (Sign in with Apple + anonymous), base tables with RLS, first migration.
- Pipeline skeleton: CLI, shared schemas, Docker sandbox runner for JS.

**M2. CodeView + one exercise type**
- `CodeBlock` component with syntax highlighting, tappable lines, highlight states, accessibility.
- Predict the Output and Tap the Line exercise views + pure grading + tests.

## Phase 2: Vertical slice (weeks 4 to 7)
**M3. Lesson runner**
- Lesson flow, progress header, result banner, lesson complete screen, hearts, XP.
- Local content from a bundled pack.

**M4. Unit 1 content, end to end**
- Author Track 1 Unit 2 ("Values and variables") in `content/`.
- Pipeline: generate + verify Spot the Bug and Predict Output pools for this unit. Review 100%.
- Spot the Bug and Code Review exercise views.

**M5. Progress and path**
- Home path, SwiftData progress, sync to backend, streaks.

**Checkpoint:** one unit is fully playable and feels great. Show it to 5 people. Fix what confuses them.

## Phase 3: AI live + money (weeks 8 to 11)
**M6. AI backend**
- Provider abstraction, Spark gate, ledger, rate limits, cost logging, daily cap.
- Prompt Duel end to end.

**M7. Purchases**
- StoreKit 2 products: monthly, annual + trial, founding lifetime, Spark packs.
- `/iap/verify`, server notifications, entitlements, paywall screens.

**M8. Onboarding**
- Onboarding flow with the first puzzle in under 60 seconds. Notification permission. Sign in with Apple.

## Phase 4: Launch content + polish (weeks 12 to 15)
**M9. MVP curriculum**
- ~10 units (see `04-curriculum.md` MVP scope), all through the pipeline.

**M10. Daily Bug + widget**
- Daily Bug endpoint, share card, widget.

**M11. Polish**
- Accessibility pass, dark mode pass, haptics, animations, empty/error states, offline behavior.
- App Store assets: screenshots, preview video (screen recording of a real puzzle), description, privacy labels.

**M12. TestFlight**
- 20 to 50 testers from the waitlist. Measure lesson completion and day-2 return. Fix the top issues.

## Phase 5: Launch (week ~16)
- Launch week: founding lifetime ($49.99, first 500), Product Hunt, Reddit build-in-public, puzzle videos, waitlist email.

## Post-launch (V1.1)
- Build Challenge, Teach It Back, Code X-ray, boss levels.
- Leagues, friends, referrals, Live Activities.
- Placement test, weak-spot review.
- More tracks.

## Later
- Story mode, Explain My Project, Confused Client, duels.
- Sponsored tracks, school licenses, certificates.
- Python track, iOS-with-AI track.

## Metrics to watch

| Metric | Target (early) |
|---|---|
| Onboarding completion | > 70% |
| First lesson completion | > 60% of installs |
| Day 1 retention | > 35% |
| Day 7 retention | > 15% |
| Trial start rate | > 8% of installs |
| Trial to paid | > 35% |
| Install to paid | 2 to 4% |
| AI cost per paying user | < $0.30/month |
| Crash-free sessions | > 99.5% |
