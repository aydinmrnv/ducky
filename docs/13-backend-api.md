# Backend API

Supabase Edge Functions. Base URL from app config. All endpoints require `Authorization: Bearer <supabase JWT>` unless noted. JSON in, JSON out.

## Error format

```json
{ "error": { "code": "OUT_OF_SPARKS", "message": "Not enough Sparks.", "details": {} } }
```

Codes: `UNAUTHORIZED`, `VALIDATION_ERROR`, `OUT_OF_SPARKS`, `RATE_LIMITED`, `DAILY_CAP_REACHED`, `AI_UNAVAILABLE`, `AI_INVALID_OUTPUT`, `NOT_ENTITLED`, `NOT_FOUND`, `INTERNAL`.

The app maps codes to friendly UI (for example `OUT_OF_SPARKS` → Spark packs / paywall sheet).

## Endpoints

### Content
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/content/manifest` | Public | Latest pack version per unit + checksums |
| (Storage) | `packs/{unitId}/v{n}.json.gz` | Public | Content packs, downloaded directly from Storage |

### Profile and progress
| Method | Path | Description |
|---|---|---|
| GET | `/me` | Profile, streak, XP totals, entitlement, Spark balance |
| PATCH | `/me` | Update onboarding answers, daily goal, timezone |
| POST | `/progress/sync` | Batch upload: lesson completions, exercise attempts, seen items, XP events. Idempotent via client-generated ids. Returns updated streak, XP, Spark balance. |

### Sparks
| Method | Path | Description |
|---|---|---|
| GET | `/sparks` | Balance + recent ledger entries |
| POST | `/sparks/claim-daily` | Grants today's free allowance if not yet claimed (server checks date in user's timezone) |
| POST | `/sparks/spend-pool` | Records a pool AI exercise use (free users), body `{ itemId }` |

### AI (all pass the Spark gate, see 06-ai-system.md)
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/ai/prompt-duel` | `{ goalId, prompt (≤400), language }` | `PromptDuelResponse` |
| POST | `/ai/build` | `{ challengeId, prompt (≤600), attempt }` | `BuildResponse` |
| POST | `/ai/teach-back` | `{ exerciseId, answer (≤300) }` | `TeachItBackResponse` |
| POST | `/ai/pool-fallback` | `{ type, unitId, concept, difficulty }` | Exercise item (flagged `unverified`) |

### Daily Bug
| Method | Path | Description |
|---|---|---|
| GET | `/daily-bug` | Today's item (by user timezone) + whether solved |
| POST | `/daily-bug/result` | `{ date, solved, timeMs }` → returns percentile and share text |

### Purchases
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/iap/verify` | JWT | Body: signed transaction (JWS) from StoreKit 2. Verifies with Apple, records purchase, grants entitlement or Sparks. Idempotent by transaction id. |
| POST | `/iap/notifications` | Apple signature | App Store Server Notifications V2 receiver. Renewals, expirations, refunds (refund of a Spark pack inserts a negative ledger entry). |
| GET | `/iap/founding-remaining` | Public | Remaining founding lifetime spots |

### Referrals (V1.1)
| Method | Path | Description |
|---|---|---|
| GET | `/referrals/link` | User's referral code/link |
| POST | `/referrals/redeem` | Invitee redeems code (once, new accounts only) |

### Leagues (V1.1)
| Method | Path | Description |
|---|---|---|
| GET | `/leagues/current` | Current league standings |

## Implementation notes

- Validate every body with zod. Reject unknown fields.
- `progress/sync` is the only write path for progress; it recomputes streak server-side using the user's timezone and last active date.
- Idempotency: client sends `clientEventId` for every event; unique constraint prevents double counting.
- Rate limits: AI endpoints 30/hour/user and burst 5/minute; sync 60/hour.
- Logging: structured logs with request id. No prompt text in logs except in `ai_calls` when needed for debugging (truncated, and only for errors).
- Global AI daily spend cap enforced in the AI gate using `ai_calls` sum for today.
