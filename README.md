# Ducky

> Working name. The name is not final and is designed to be easy to change. See [docs/02-brand.md](docs/02-brand.md).

**Ducky is a native iOS app that teaches people how to code with AI, and actually understand what the AI built.**

It works like Duolingo: short daily lessons, streaks, XP, and a mascot. But instead of memorizing syntax, learners build real understanding by reading code, predicting what it does, catching the AI's mistakes, directing the AI to build things, and fixing code by hand.

The AI is not a chatbot on the side. **The AI is the exercise.** Ducky (the duck mascot) writes code for you, confidently, and is sometimes wrong. Your job is to catch it.

## Why this exists

More people than ever are building software with AI tools like Cursor, Claude Code, Lovable, and Replit. Most of them cannot read, judge, debug, or secure what the AI produces. When something breaks, they are stuck.

Existing learn-to-code apps either teach syntax the old way (typing code on a phone keyboard) or bolt an AI chatbot onto traditional lessons. Ducky teaches the skill that matters now: **understanding, directing, and checking AI-written code**, grounded in real standards, with every answer verified by actually running the code.

## The pitch

> Learn to build with AI, and actually understand what it built. $4.99/month.

## Core principles

1. **Tap-first.** No typing code on a phone keyboard except short, focused exercises with a custom code keyboard.
2. **The AI is the exercise.** Spot its bug, judge its output, review its pull request, prompt it to build something and get graded.
3. **Hand coding and AI coding together.** Every unit: learn it by hand, direct the AI, check the AI, fix it by hand.
4. **Factually correct, always.** Content is grounded in real standards (MDN, WCAG, OWASP, official language docs) and every answer is verified by running code, never by trusting AI output.
5. **Cheap to run, cheap to buy.** Most AI content is pre-generated and verified in batches. Live AI calls are small, structured, and capped.
6. **Beautiful, native, accessible.** 100% SwiftUI. A learn-to-code app cannot have bad UI.

## Documentation map

Read in order if you are new to the project.

| Doc | What it covers |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Instructions for Claude Code: how to build this repo, conventions, rules |
| [docs/00-decisions.md](docs/00-decisions.md) | Decisions made so far and open questions |
| [docs/01-product-vision.md](docs/01-product-vision.md) | What Ducky is, who it is for, competitors, positioning |
| [docs/02-brand.md](docs/02-brand.md) | Name, mascot, voice, copy, how to rename |
| [docs/03-features.md](docs/03-features.md) | Full feature list, MVP vs later |
| [docs/04-curriculum.md](docs/04-curriculum.md) | Tracks, units, lesson structure, standards |
| [docs/05-exercise-types.md](docs/05-exercise-types.md) | Every exercise type: interaction, data, grading |
| [docs/06-ai-system.md](docs/06-ai-system.md) | How AI is used, models, prompts, costs, Sparks, safety |
| [docs/07-content-pipeline.md](docs/07-content-pipeline.md) | Generating and verifying content so it is never AI slop |
| [docs/08-monetization.md](docs/08-monetization.md) | Free vs paid, pricing, trial, lifetime, Sparks, referrals |
| [docs/09-architecture.md](docs/09-architecture.md) | System architecture, stack, services |
| [docs/10-ios-app.md](docs/10-ios-app.md) | SwiftUI app structure, screens, navigation, platform features |
| [docs/11-design.md](docs/11-design.md) | Visual design, code presentation, motion, accessibility |
| [docs/12-data-models.md](docs/12-data-models.md) | Data models and JSON schemas |
| [docs/13-backend-api.md](docs/13-backend-api.md) | Backend API endpoints |
| [docs/14-gamification.md](docs/14-gamification.md) | Streaks, XP, hearts, leagues, Daily Bug |
| [docs/15-roadmap.md](docs/15-roadmap.md) | Phases, milestones, validation, launch, metrics |
| [docs/16-marketing.md](docs/16-marketing.md) | Faceless puzzle videos, launch plan, growth |
| [reference/lessons.ts](reference/lessons.ts) | Early sketch of the AI lesson backend (reference only) |

## Repo layout (target)

```
ducky/
├── README.md
├── CLAUDE.md
├── docs/                 # Product and engineering documentation (this is the source of truth)
├── reference/            # Sketches and prototypes, not production code
├── ios/                  # SwiftUI app (Xcode project)
├── backend/              # Supabase project: SQL migrations + Edge Functions (TypeScript)
├── pipeline/             # Content generation + verification scripts (TypeScript, runs on a Mac)
└── content/              # Authored curriculum (JSON), reviewed in git
```

## Status

Pre-build. Documentation only. Build with Claude Code following [CLAUDE.md](CLAUDE.md) and [docs/15-roadmap.md](docs/15-roadmap.md).

Built by Nullstack.
