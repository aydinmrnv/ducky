# Monetization

## Principles

- **Generous free plan.** Anyone can learn the core curriculum for free. Paid unlocks AI coaching, speed, and depth.
- **Never block mid-lesson.** Paywalls appear at natural moments, never in the middle of an exercise.
- **Cheap.** Ducky is the most affordable serious option. Prices can rise later for new users once there is traction.
- **All digital purchases through Apple IAP** (StoreKit 2). Organizations may be billed directly (Apple allows apps sold directly to organizations to use other payment methods).

## Plans

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | Core lessons, 10 Sparks/day, hearts |
| Monthly | $4.99/month | All paid features |
| Annual | $29.99/year | 14-day free trial (introductory offer). Main plan shown on paywall. |
| Founding Lifetime | $49.99 once | First 500 buyers or launch window only. Non-consumable. |
| Lifetime (standard) | $89.99 once | After the founding offer ends |

Apple Small Business Program: 15% commission. Net per paying user is roughly $25/year whether they are annual or monthly (average monthly retention ~6 months).

## Free vs paid

| Feature | Free | Paid |
|---|---|---|
| All core lessons (static exercises) | Yes | Yes |
| Streaks, XP, Daily Bug, widget | Yes | Yes |
| Hearts | 5, refill 1 per 4 hours | Unlimited |
| AI exercises (Spot the Bug pool, Code Review pool) | Counted against daily Sparks | Included in monthly Sparks |
| Sparks | 10/day (don't accumulate past 10) | 1,500/month (roll over up to 1 month) |
| Prompt Duel, Build Challenge, Teach It Back | Uses Sparks | Uses Sparks |
| Boss levels | Preview only | Yes |
| Adaptive weak-spot review | No | Yes |
| Explain My Project (later) | No | Yes |
| On-device hints | Yes | Yes |
| Spark packs | Can buy | Can buy |

Lifetime users get the same monthly Spark allowance as subscribers (open question to confirm).

## Sparks

Sparks are the in-app currency for AI-powered exercises. Never call them tokens in the UI.

### Earning
- Daily free allowance (free: 10/day, paid: monthly grant)
- Streak milestones: 7 days (+20), 30 days (+50), 100 days (+150)
- Referral: inviter +100, invitee +50, when the invitee completes their first lesson
- Unit completion: +10

### Spending
- Pool AI exercise: 1 (free users), included (paid users, still decremented but from a large grant)
- Prompt Duel: 1
- Teach It Back: 1
- Build Challenge: 3 per attempt

### Packs (consumable IAP)
| Pack | Price | AI cost to us (est.) |
|---|---|---|
| 150 Sparks | $0.99 | < $0.05 |
| 500 Sparks | $2.99 | < $0.15 |
| 1,500 Sparks | $6.99 | < $0.45 |

Purchased Sparks never expire. Granted Sparks follow the rules above.

### Ledger
Append-only `spark_ledger` with reasons (`daily_grant`, `monthly_grant`, `purchase`, `referral`, `streak_bonus`, `spend_prompt_duel`, `refund`...). Balance = sum. Purchases are recorded only after server-side transaction verification.

## Trial

- 14-day free trial on the annual plan via StoreKit introductory offer.
- Shown: at the end of onboarding (with a clear "Continue for free" option) and at moments of desire (out of Sparks, out of hearts, boss level).
- Trial users get the full paid experience.
- Local notification 2 days before the trial ends (respect notification permission). Reduces refunds and bad reviews.

## Paywall design rules
- Headline about outcome, not features: "Learn to build with AI. And actually understand it."
- Annual plan preselected, showing per-month equivalent ($2.50/month).
- Clear trial terms and renewal price (App Store requirement).
- Restore purchases link. Terms and Privacy links.
- Founding lifetime shown as a separate card while the offer is live, with remaining count if feasible (server-tracked).
- Close button always visible.

## App Store rules to respect
- All digital goods via IAP (subscriptions, lifetime, Spark packs).
- Never reward ratings or reviews.
- Referral rewards are allowed (no requirement to rate or review).
- Clearly disclose subscription terms.
- Restore purchases must work.

## Additional revenue (later)
1. **Sponsored tracks:** developer tool companies pay to sponsor a free track teaching their product (clearly labeled "Sponsored"). Content still goes through the verification pipeline. Requires a few thousand active users.
2. **School and team licenses:** per-seat pricing ($3 to $5/student/month), teacher dashboard. Billed directly to the organization.
3. **Paid certificates:** small one-time fee for a verified completion certificate (via IAP).
4. **Win-back offers:** discounted annual for lapsed subscribers.
5. **Regional pricing:** lower prices in price-sensitive markets via App Store Connect.

Not doing: banner ads, affiliate links inside lessons.

## Revenue model (year 1 scenarios)

| Scenario | Downloads | Paid conversion | Paying users | Year 1 revenue |
|---|---|---|---|---|
| Conservative | 5,000 | 2% | 100 | ~$4k (incl. ~30 lifetime) |
| Realistic | 20,000 | 3% | 600 | ~$20k (incl. ~100 lifetime) |
| Strong | 80,000 | 4% | 3,200 | ~$100k+ |

Goal: $10k in year 1 ≈ 400 paying users ≈ 13,000 to 15,000 downloads.

## Price increases
Start cheap. Once there are reviews and steady traffic, test $39.99/year for new users only. Existing subscribers keep their price.
