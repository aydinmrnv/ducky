# Brand

## Name

**Working name: Ducky.** Not final. Everything must be built so the name can change with a one-line edit.

- App Store name: `Ducky: Learn to Code with AI` (28 characters, Apple's limit is 30).
- Subtitle (draft): `Catch the AI's bugs. Daily.` (keep under 30 characters, keyword-rich).
- "Quack" is the mascot's signature sound, used in copy. Not the app name (several App Store apps are already called Quack, and "quack" also means a fake expert).

### Why Ducky
- Rubber duck debugging is a beloved developer tradition: you explain your code to a rubber duck to find bugs.
- Ducky flips it: the duck explains code to you, and you catch its mistakes.
- Instant mascot, friendly, works on TikTok and in notifications.

### Known considerations
- "Ducky" is also a mechanical keyboard brand. Different category, but the audience overlaps.
- No other coding app named Ducky was found in an App Store search (not exhaustive). Reserve the name in App Store Connect early.

## Keeping the name changeable (required)

| Thing | Rule |
|---|---|
| Bundle ID | Neutral, permanent. Use `one.nullstack.learn` (or similar). Never include "ducky". |
| App Store Connect SKU | Neutral, permanent. |
| Xcode project, targets, modules | Neutral names: `LearnApp`, `LearnWidgets`, `DesignSystem`, etc. |
| Display name (`CFBundleDisplayName`) | From build settings, one place. |
| In-app brand words | All from a single `Brand` enum (see below). Never hardcode in views or strings. |
| Mascot art | Designed to work without the word "Ducky" next to it. |
| Domains, trademarks | Hold off on paid commitments until the name is final. Free: reserve App Store name, social handles. |

### Brand constants (iOS)

```swift
enum Brand {
    static let appName = "Ducky"
    static let mascotName = "Ducky"
    static let mascotSound = "Quack"
    static let currencyName = "Sparks"
    static let currencyNameSingular = "Spark"
    static let tagline = "Learn to code with AI"
}
```

Localized strings reference these through interpolation, for example `"%@ found a bug"` with `Brand.mascotName`. Renaming = edit `Brand` + App Store metadata + icon.

## Mascot

**Ducky is the face of the AI.** When the AI writes code, Ducky wrote it. When the AI explains something, Ducky explains it.

### One duck, two modes (current plan)
1. **Teacher mode** (lessons, explanations, hints): calm, clear, encouraging, precise.
2. **Show-off mode** (bug exercises, code reviews, prompt duels): confident, a little smug, writes code fast and sometimes wrong. Good-natured when caught.

The modes make it clear when Ducky is teaching (trust it) versus showing off (check it). Visually: teacher mode has glasses or a calm pose; show-off mode has a cocky pose. Exact art TBD.

### Personality
- Confident, witty, never mean.
- Owns mistakes with humor: "Ok fine. That was a bug."
- Celebrates the learner, not itself, when they win.
- Never condescending about not knowing things.
- Not childish. Audience is teens and adults.

### Where the mascot appears
- Onboarding, streak moments, Daily Bug, celebrations, notifications, empty states, the paywall (lightly).
- NOT on every lesson screen. Code is the hero there. Ducky appears as a small avatar next to AI-written code.

## Voice and copy

### Principles
- Short. Max 2 to 3 short sentences before an interaction.
- Plain English. Define jargon the first time (tap-to-define glossary).
- Direct and friendly, light humor, no forced jokes.
- **No em dashes.** Use commas, colons, periods, parentheses.
- No emoji in core lesson text. Light emoji allowed in celebrations and notifications (the duck emoji is on-brand).

### Sample copy

| Moment | Copy |
|---|---|
| Correct answer | "Quack. You caught it." |
| Wrong answer | "Not quite. Look at line 3 again." |
| Ducky's buggy code intro | "Trust me, this works." |
| Ducky caught | "Ok fine. That was a bug." |
| Streak at risk (notification) | "Quack. Your streak misses you." |
| Daily Bug share | "I quacked today's bug in 14s. Can you?" |
| Out of Sparks | "Ducky's out of energy for today. Get more Sparks or come back tomorrow." |
| Paywall headline | "Learn to build with AI. And actually understand it." |

## Visual identity (summary, details in 11-design.md)
- One accent color plus neutrals. Accent TBD, leaning toward a warm duck-bill orange or a calm yellow for the mascot with a restrained UI accent.
- SF Pro for UI, SF Mono for code.
- App icon: the duck, simple, recognizable at small sizes, no text.
