# Architecture

## System diagram

```
┌──────────────────────────┐        HTTPS (JWT)        ┌───────────────────────────────┐
│ iOS app (SwiftUI)        │ ────────────────────────► │ Supabase Edge Functions (TS)  │
│ - Lessons, exercises     │                           │ - /ai/* (Prompt Duel, Build,  │
│ - SwiftData cache        │ ◄──────────────────────── │   Teach It Back, fallback)    │
│ - StoreKit 2             │                           │ - /sparks, /progress, /daily  │
│ - Foundation Models      │                           │ - /iap (transaction verify)   │
│ - WidgetKit, ActivityKit │                           └──────────────┬────────────────┘
│ - WKWebView (builds)     │                                          │
└───────────┬──────────────┘                                          ▼
            │ download packs                              ┌───────────────────────────┐
            ▼                                             │ Postgres (RLS)            │
┌──────────────────────────┐                              │ users, progress, ledger,  │
│ Supabase Storage         │                              │ ai_calls, purchases, ...  │
│ content packs (JSON.gz)  │                              └───────────────────────────┘
└───────────▲──────────────┘                                          ▲
            │ publish                                                 │ App Store Server
┌───────────┴──────────────┐                              ┌───────────┴───────────────┐
│ Pipeline (Mac, TS CLI)   │ ── Batch API ──► AI provider │ App Store Server          │
│ generate/verify/publish  │                              │ Notifications V2 → /iap   │
│ Docker sandbox, Playwright│                             └───────────────────────────┘
└──────────────────────────┘
                                   AI providers: Anthropic (primary), Gemini (fallback)
```

## Components

### iOS app
- SwiftUI, Swift 6 strict concurrency, minimum iOS 26.
- Local-first: lessons and progress work offline from cached packs and SwiftData. Sync to backend when online.
- Details in `10-ios-app.md`.

### Backend (Supabase)
- **Auth:** Sign in with Apple (primary). Anonymous sessions allowed for guests, upgraded on sign-in.
- **Postgres:** user data, progress, Spark ledger, purchases, AI call logs, Daily Bug, leagues. RLS on all tables.
- **Edge Functions (TypeScript/Deno):** AI proxy, Spark gate, IAP verification, Daily Bug, sync endpoints.
- **Storage:** content packs bucket (public read).
- **Cron (pg_cron or scheduled functions):** daily grants reset logic, Daily Bug rotation, league rollover, cost alerts.

Why Supabase: one vendor for auth, database, storage, and functions; generous free tier; Postgres with RLS; TypeScript functions. Swappable later because the app only talks to Ducky's own endpoints.

### Pipeline
- TypeScript CLI on the owner's Mac. Uses provider Batch APIs, Docker for sandboxed execution, Playwright + axe-core for web checks.
- Shares JSON schemas with backend and (mirrored) iOS models.

## Shared schemas

- Source of truth: `backend/supabase/functions/_shared/schemas/*.ts` (zod) exported to JSON Schema in `schemas/` at build time.
- iOS `Codable` models mirror them. A test in the pipeline validates sample JSON against both.

## Data flow examples

### Static lesson (offline capable)
1. App opens lesson → reads pack from cache → renders exercises → grades locally.
2. Progress written to SwiftData immediately, queued for sync.
3. Sync job posts progress batches to `/progress/sync` when online.

### Prompt Duel (live)
1. App → `POST /ai/prompt-duel` with prompt text and exercise id.
2. Function: auth → Spark gate → provider call (structured) → validate → ledger spend → log → respond.
3. App renders code, assumptions, question. Learner answers. App sends result to progress sync.

### Purchase
1. App purchases via StoreKit 2 → gets signed transaction.
2. App → `POST /iap/verify` with the signed transaction (JWS). Backend verifies with Apple's App Store Server API library, records purchase, grants entitlements or Sparks.
3. App Store Server Notifications V2 → `/iap/notifications` keeps subscription state current (renewals, refunds, expirations).
4. App checks entitlement locally via `Transaction.currentEntitlements` for instant UI, backend is the source of truth for Sparks.

## Security

- No secrets in the app binary. AI provider keys only in Supabase secrets.
- JWT required on every function except public content and notifications endpoint (which verifies Apple's signature).
- RLS: users read/write only their rows. Ledger inserts only via functions (service role), never directly from the client.
- Rate limits per user and per IP on AI endpoints.
- Build Challenge HTML sanitized server-side and rendered in a locked-down WKWebView (no network, no navigation, no file access).

## Environments

- `dev` and `prod` Supabase projects.
- App build configurations: Debug (dev backend), Release (prod backend). Base URL and anon key from xcconfig, not hardcoded in Swift.
- StoreKit testing with a local `.storekit` configuration file in Debug.

## Analytics

Privacy-respecting, first-party: events table in Postgres (or TelemetryDeck as an optional third-party). Track:
- onboarding_step, lesson_start, lesson_complete, exercise_answer (type, correct, time), paywall_view, purchase, trial_start, trial_convert, spark_spend, daily_bug_complete, share_tap, streak_lost.
No personal data in events beyond user id.

## Costs (monthly, early stage)
- Supabase: free tier initially, Pro ($25) when needed.
- AI: covered by $100 Claude credits initially, capped.
- Apple Developer: $99/year.
- Domain: optional.
