# Design

## Direction: "Linear meets Duolingo"

Duolingo's addictive loop and warmth, with a clean, grown-up, professional look. The audience is teens and adults building real things. The app should feel like a pro tool that happens to be fun. **A learn-to-code app with bad UI loses credibility instantly.**

## Principles

1. **One thing per screen.** One question, one primary action.
2. **Code is the hero.** On exercise screens, code gets the most space and the best typography.
3. **Instant.** Pre-generated content loads with no spinners. Live AI shows progress (code streaming in or skeleton lines), never a blank wait.
4. **Motion with meaning.** Animate to explain (variables changing, a bug line highlighting, XP flowing to the counter), not to decorate.
5. **Restraint.** One accent color, plenty of space, few badges, no popups stacked on popups.
6. **Native.** Use current Apple design language and system components. It should feel like it belongs on iOS.

## Color

Tokens (exact values TBD in the design system; keep everything token-based):

| Token | Use |
|---|---|
| `background`, `surface`, `surfaceElevated` | Neutrals, light and dark variants |
| `textPrimary`, `textSecondary`, `textTertiary` | Text, all must meet 4.5:1 on their backgrounds |
| `accent` | Primary buttons, current path node, links. One accent only. |
| `mascot` | The duck's yellow/orange. Used for Ducky, streak flame, celebrations. Not for UI controls. |
| `success`, `error`, `warning` | Feedback. Always paired with an icon and text, never color alone. Choose a pair that differs in lightness, not only hue. |
| `codeBackground`, syntax tokens (`keyword`, `string`, `number`, `comment`, `function`, `punctuation`) | Code theme, tuned for light and dark |

- **Dark mode is first-class**, designed together with light mode, not inverted later.
- Code backgrounds slightly differ from surfaces so code blocks read as code.

## Typography

- **UI:** SF Pro (system). Use text styles (`.title`, `.headline`, `.body`, `.footnote`) so Dynamic Type works.
- **Code:** SF Mono, scaled with Dynamic Type (relative to `.body`).
- Lesson prompts: `.title3` semibold. Explanations: `.body`. Max 2 to 3 short sentences.

## Spacing and shape

- 8pt grid. Screen padding 20pt. Card padding 16pt.
- Corner radius tokens: small 8, medium 14, large 22. Buttons and cards use continuous corners.
- Touch targets ≥ 44pt.

## Code presentation

- SF Mono, line height ~1.4, line numbers in `textTertiary`.
- Authored for phone width (~38 characters). Horizontal scroll only as fallback, with a fade edge hint.
- **Tappable lines:** full-width row hit area, clear selected state (accent outline + subtle fill), haptic tick on select.
- **Highlight states:** bug line (error tint + icon), fixed line (success tint), current execution line in Code X-ray (full-row accent tint).
- Ducky avatar appears next to AI-written code with a small "Ducky wrote this" label.

## Key components (design system)

- `PrimaryButton` (Check / Continue), `SecondaryButton`
- `CodeBlock` (modes described in `10-ios-app.md`)
- `OptionCard` (multiple choice, diagnosis, verdicts)
- `TokenChip` (fill the blank, prompt builder)
- `ResultBanner` (correct/incorrect sheet from bottom)
- `PathNode` (locked, available, current, complete, checkpoint)
- `StatPill` (streak, Sparks, hearts)
- `MascotView` (Ducky in poses: teacher, show-off, celebrating, sad, sleeping)
- `ProgressHeader` (lesson progress bar + close + hearts)

## Motion and feedback

- Correct: quick scale/bounce on the banner, success haptic, XP number ticks up.
- Wrong: gentle shake of the selected option (disabled under Reduce Motion), error haptic, calm banner. No harsh red full-screen flashes.
- Lesson complete: one celebration moment (Ducky + XP + streak). Keep it under 2 seconds and skippable.
- Spring animations, short durations. Respect Reduce Motion everywhere.

## Sound

Optional, off by default. Subtle UI sounds for correct/wrong/complete.

## Things to avoid

- Badges, banners, and popups everywhere
- Childish illustrations or cartoon overload
- Walls of text
- Gradient washes and generic "AI app" aesthetics
- Emoji in core lesson text
- Fake urgency (except the honest, real founding lifetime limit)

## Screens to design first

1. **Lesson screen** (Spot the Bug: code + tappable lines + Check)
2. **Result state** (correct and incorrect)
3. **Home path**
4. **Paywall**

If these four feel great, every other screen follows their patterns.

## Mascot art

- Simple, geometric, recognizable at 20pt and at 200pt.
- Works without text. Poses listed above.
- Commission or draw once the name is final; use a simple placeholder shape until then.
