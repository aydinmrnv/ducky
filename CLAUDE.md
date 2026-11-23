# CLAUDE.md

Instructions for Claude Code working in this repo. Read this file fully before writing any code.

## What you are building

Ducky: a native iOS app (SwiftUI) that teaches people to code with AI, Duolingo-style. Plus a small Supabase backend and an offline content pipeline. Full context lives in `docs/`. **The docs are the source of truth.** If code and docs disagree, ask the owner (Aydin) before changing either.

Read these before starting any task:
1. `docs/00-decisions.md` (what is decided, what is open)
2. The doc for the area you are touching (see README documentation map)

## Hard rules

1. **Native only.** The iOS app is 100% SwiftUI. No React Native, Flutter, or web views for app UI. `WKWebView` is allowed ONLY for rendering learner-built pages inside Build Challenges (see `docs/05-exercise-types.md`).
2. **Never ship an API key in the app.** All AI calls go through the backend (`backend/`). The app talks to Ducky's API only.
3. **The product name is a variable.** Never hardcode "Ducky" (or the mascot name, or the "quack" copy) in views. Use the brand constants described in `docs/02-brand.md`. The bundle ID and internal module names must stay neutral (no "ducky").
4. **No em dashes in user-facing copy.** Use commas, colons, periods, or parentheses. This applies to app strings, App Store text, and docs.
5. **Correctness over cleverness.** Every exercise answer must be verifiable. Never let a live AI response decide whether a learner is right unless the exercise type explicitly allows AI grading (see `docs/05-exercise-types.md`).
6. **Cost discipline.** Live AI calls must use structured output (forced tool use / JSON schema), small `max_tokens`, input length caps, and the Spark gate. See `docs/06-ai-system.md`.
7. **Accessibility is not optional.** Dynamic Type, VoiceOver labels, Reduce Motion, 44pt touch targets, 4.5:1 contrast for text.
8. **Don't invent product decisions.** If something isn't specified in docs, pick the simplest option that matches the principles, note it in your summary, and add it to the "Open questions" section of `docs/00-decisions.md`.

## Tech stack (decided, see docs/09-architecture.md)

- **iOS:** Swift 6, SwiftUI, Observation (`@Observable`), SwiftData for local persistence, StoreKit 2, Sign in with Apple, WidgetKit, ActivityKit, Foundation Models framework (on-device AI, gated by availability), Swift Testing.
- **Minimum iOS:** 26.0.
- **Backend:** Supabase (Postgres, Auth with Sign in with Apple, Row Level Security, Storage, Edge Functions in TypeScript/Deno).
- **AI:** Provider-agnostic interface in the backend. Default model: Claude Haiku (cheapest current Haiku). Fallback provider supported (for example Gemini). Content generation uses a stronger model via Batch API.
- **Pipeline:** TypeScript (Node 22+), runs locally on a Mac. Code execution in Docker sandboxes with no network. Playwright + axe-core for web checks.

## Repo layout

```
ios/        Xcode project. App target + Widget extension.
backend/    supabase/ (migrations, functions, config)
pipeline/   Content generation + verification CLI
content/    Authored curriculum JSON (tracks, units, lessons, static exercises)
docs/       Documentation
reference/  Prototypes. Do not import from here.
```

## iOS conventions

- Feature-folder structure (see `docs/10-ios-app.md`). One feature per folder: `Views/`, `Models/`, `Services/` as needed.
- Views are small and composable. No view file over ~250 lines; extract subviews.
- State: `@Observable` view models or stores injected via `@Environment`. No singletons except clearly documented services.
- Networking: one `APIClient` actor. Typed request/response models (`Codable`) that mirror `docs/12-data-models.md` exactly.
- All strings in a String Catalog (`Localizable.xcstrings`). Brand words come from `Brand` constants.
- Design tokens (colors, type, spacing, radii) live in one `DesignSystem` module. Never use raw hex or magic numbers in views.
- Haptics through one `Haptics` service so they can be toggled.
- Previews for every screen, including dark mode and large Dynamic Type.
- Tests: Swift Testing for logic (grading, streaks, Spark math, content decoding). Snapshot-free; keep tests fast.

## Backend conventions

- SQL migrations in `backend/supabase/migrations/`, never edit an applied migration.
- RLS enabled on every table. Learners can only read/write their own rows.
- Edge Functions: one function per endpoint group. Validate every request body (zod or equivalent). Return typed JSON errors: `{ "error": { "code": "OUT_OF_SPARKS", "message": "..." } }`.
- The Spark ledger is append-only. Balances are computed, never edited directly.
- Secrets via Supabase secrets, never committed.

## Pipeline conventions

- Every generated exercise must pass verification before it is published (see `docs/07-content-pipeline.md`). No manual bypass flag in production publishing.
- Generated packs are versioned JSON, uploaded to Supabase Storage. The app downloads and caches them.

## Workflow

1. Work in small, reviewable steps that map to milestones in `docs/15-roadmap.md`.
2. Build the MVP vertical slice first: one unit, end to end, before widening.
3. After each task: build succeeds, tests pass, previews render, summary of what changed and any open questions.
4. Do not add third-party dependencies without a reason written in the PR/summary. Prefer Apple frameworks.

## Definition of done (any feature)

- Matches the relevant doc.
- Works in light and dark mode, at default and largest Dynamic Type.
- VoiceOver can complete the flow.
- No hardcoded brand strings, colors, or secrets.
- Tests for any logic that decides correctness, money, Sparks, or streaks.
