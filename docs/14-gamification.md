# Gamification

Goal: bring people back daily without feeling manipulative. Keep it honest and calm.

## Streaks
- A day counts when the learner earns their daily XP goal (default: complete 1 lesson).
- Day boundaries use the learner's timezone (stored in profile, updated from device).
- **Streak freeze:** paid users get 2 per month automatically; free users earn 1 at 7-day and 30-day milestones. A freeze is consumed automatically on a missed day.
- Streak milestones grant Sparks (see `08-monetization.md`).
- Losing a streak: gentle copy, offer to start again. No guilt-trips.

## XP
| Action | XP |
|---|---|
| Correct static exercise | 10 |
| Correct AI exercise (Spot the Bug, Code Review) | 15 |
| Prompt Duel | 10 + 2 × promptScore |
| Build Challenge pass | 30 (+10 first try) |
| Lesson complete bonus | 10 |
| Perfect lesson (no mistakes) | +10 |
| Daily Bug solved | 20 |

## Hearts (free users)
- 5 hearts. Lose 1 per wrong answer. Refill 1 every 4 hours.
- At 0 hearts: can practice in review mode (no hearts needed, reduced XP), wait, or upgrade. Never fully locked out of learning.
- Paid: unlimited.

## Daily Bug
- One Spot the Bug item per day, same for everyone, chosen from verified pool items of moderate difficulty.
- Timed. Result shows time and percentile.
- **Share card** (Wordle style, no spoilers): "Ducky Daily Bug #42 · 🦆 caught in 14s · Top 12%". Shareable image + text.
- Appears in the widget and as a notification (optional, user chosen time).
- Archive of past Daily Bugs for paid users.

## Leagues (V1.1)
- Weekly XP leagues of ~30 learners with similar activity.
- Top 5 promote, bottom 5 demote. Tiers named after ducks or code concepts (TBD, keep it tasteful).
- Opt-out available.

## Achievements (V1.1)
Small, meaningful set (no badge spam):
- First bug caught
- 7 / 30 / 100 day streak
- Unit complete (per track)
- Security spotter (catch 10 security bugs)
- Prompt pro (5 Prompt Duels with score 5)
- First build passed

## Notifications (respectful)
- Max 1 per day by default.
- Streak reminder at the learner's usual time (learned from activity) if not done today.
- Daily Bug available (if opted in).
- Trial ending in 2 days.
- Copy uses Ducky's voice, never shames: "Quack. Your streak misses you."
