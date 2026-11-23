# Features

Priority legend: **MVP** (needed for launch), **V1.1** (first months after launch), **Later**.

## Learning

| Feature | Priority | Description |
|---|---|---|
| Learning path | MVP | Duolingo-style vertical path of units and lessons per track. Locked/unlocked/completed states. |
| Lessons | MVP | 3 to 8 minute sessions of 8 to 15 exercises. Mix of static and AI-powered exercise types. |
| Static exercise types | MVP | Predict the output, tap the bug, fill the blank, order the steps, pick the better prompt, multiple choice concept checks. See `05-exercise-types.md`. |
| Spot the Bug (AI) | MVP | Pre-generated, verified pool. Find, diagnose, fix, explain. |
| Prompt Duel (AI, live) | MVP | Learner writes or picks a prompt, Ducky builds literally, learner judges. |
| Code Review (AI) | MVP | Ducky submits a pull request. Approve or reject with a reason. |
| Build Challenge (AI, live) | V1.1 | Prompt Ducky to build a web page, it renders in-app, graded by real tests. |
| Teach It Back (AI, live) | V1.1 | Explain a concept in 1 to 2 sentences, AI grades against a rubric. |
| Confused Client (AI, live) | Later | Ask the right questions to turn a vague idea into a spec. |
| Code X-ray | V1.1 | Step through code line by line, watch variables change. |
| Hand-fix with code keyboard | MVP | Short typing exercises with a custom symbols keyboard. |
| Tap-to-define glossary | MVP | Any underlined term opens a short definition sheet. |
| Placement test | V1.1 | Skip units you already know. |
| Weak-spot review | V1.1 | Spaced repetition generated from the learner's mistakes. |
| Boss levels | V1.1 | End-of-unit project: guide Ducky to build a mini app, check each piece. |
| Story mode | Later | You're a new hire at a fake startup. Weekly tasks, broken deploys, PRs, bug reports. |
| Explain My Project | Later | Connect GitHub or paste code, get personalized lessons from your own project. Paid. |
| "Based on" source tags | MVP | Each lesson shows the standard it's based on (MDN, WCAG, OWASP...) with a link. |

## Engagement

| Feature | Priority | Description |
|---|---|---|
| Streaks | MVP | Daily streak, streak freeze. |
| XP and daily goal | MVP | XP per exercise, daily XP goal set in onboarding. |
| Hearts | MVP | Free users lose a heart per wrong answer, refill over time. Unlimited for paid. |
| Daily Bug | MVP | One puzzle for everyone each day, timed, shareable Wordle-style result. |
| Home Screen widget | MVP | Daily Bug + streak. |
| Leagues | V1.1 | Weekly XP leagues with promotion/demotion. |
| Friends | V1.1 | Follow friends, see streaks, friend leaderboard. |
| Duels | Later | Live head-to-head Spot the Bug. |
| Live Activity | V1.1 | Streak at risk in the evening, Daily Bug timer. |
| Notifications | MVP | Streak reminders, Daily Bug, trial ending (2 days before). Respectful frequency. |
| Achievements | V1.1 | A small set of meaningful badges, not dozens. |

## Account and money

| Feature | Priority | Description |
|---|---|---|
| Sign in with Apple | MVP | Primary sign-in. Allow starting as guest, prompt to sign in to save progress. |
| Subscriptions (StoreKit 2) | MVP | Monthly, annual with 14-day trial. |
| Founding lifetime | MVP | Non-consumable, limited offer. |
| Spark packs | MVP | Consumable IAP. |
| Referrals | V1.1 | Invite link, both get Sparks. |
| Paywall | MVP | After onboarding (skippable) and at moments of desire (out of Sparks, hearts, boss level). |
| Restore purchases | MVP | Required. |
| Certificates | Later | Paid verified certificate after finishing a track. |
| Win-back offers | V1.1 | Discount for lapsed subscribers (Apple offer codes / win-back offers). |
| School/team licenses | Later | Sold directly to organizations. |

## Platform polish

| Feature | Priority | Description |
|---|---|---|
| Dark mode | MVP | First-class. |
| Dynamic Type, VoiceOver, Reduce Motion | MVP | Full support. |
| Haptics | MVP | Correct, wrong, streak, celebrations. Toggle in settings. |
| Offline lessons | MVP | Downloaded content packs work offline. AI exercises require network except on-device hints. |
| On-device hints | V1.1 | Foundation Models framework for rephrasing and hints when available. |
| iPad layout | Later | |
| Share extension | Later | Share code from Safari/GitHub into the app for an instant explanation. |

## Out of scope for v1
- Android, web app.
- Full IDE on phone.
- Community forums.
- Video lessons.
- Ads.
