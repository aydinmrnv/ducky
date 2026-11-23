# Exercise types

Every exercise is one screen, one task. Exercise data is structured JSON (schemas in `12-data-models.md`). **The app checks answers itself** using the data, except where AI grading is explicitly allowed.

## Summary

| Type | Source | Live AI? | Spark cost | Grading |
|---|---|---|---|---|
| Predict the Output | authored / generated pool | No | 0 | Exact match (verified by execution) |
| Tap the Line | authored / pool | No | 0 | Line index match |
| Fill the Blank | authored / pool | No | 0 | Token match (accepted variants listed) |
| Order the Steps | authored | No | 0 | Sequence match |
| Multiple Choice | authored | No | 0 | Option match |
| Pick the Better Prompt | authored / pool | No | 0 | Option match |
| Spot the Bug | generated pool | No (fallback live) | 1 if from AI fallback, 0 from pool for free users within daily allowance (see Sparks) | Verified bug line + diagnosis + fix |
| Code Review | generated pool | No (fallback live) | Same as above | Verdict + problem line |
| Hand Fix | pool | No | 0 | Normalized code match OR test execution |
| Prompt Duel | live | Yes | 1 | Learner self-judges + AI prompt score (advisory) |
| Build Challenge | live | Yes | 3 | Automated tests in WKWebView (deterministic) |
| Teach It Back | live | Yes | 1 | AI against a fixed rubric (allowed) |
| Code X-ray | authored | No | 0 | Not graded (interactive) |

> Note on Sparks for pool exercises: pool exercises cost the business almost nothing, but they are the "AI-powered" experience. Free users get a daily allowance of AI exercises (pool or live). Paid users get a large monthly allowance. See `08-monetization.md` and `06-ai-system.md`.

## Static types

### Predict the Output
- Shows a short code snippet (max ~12 lines, phone-width lines).
- Learner picks the output from 3 to 4 options (or types it for short outputs, later levels).
- Distractors are the common misconceptions (for example `"22"` vs `4` for `"2" + 2`).
- **Every correct answer is produced by actually running the code in the pipeline.**

### Tap the Line
- "Tap the line that makes the counter start at 1."
- Code lines are tappable rows. Selection is clear, then Check.

### Fill the Blank
- Code with one or more blanks. Learner taps tokens from a word bank.
- Accepted answers list all valid variants.

### Order the Steps
- Drag (or tap in order) code lines or plain-language steps into the right order.
- Use for algorithms, request/response flows, git workflows.

### Multiple Choice (concept check)
- Plain-language question about a concept. Use sparingly.

### Pick the Better Prompt
- Two or three prompts for the same goal. Learner picks the one that would get the right result.
- Explanation highlights what made it better (constraints, examples, context).

## AI-powered types

### Spot the Bug
Ducky (show-off mode) presents code with "Trust me, this works."

**Answer modes (difficulty ramps):**
1. **Find:** tap the broken line.
2. **Diagnose:** choose what's wrong from options ("missing await", "exposed API key", "off by one").
3. **Fix:** choose the correct fix, or hand-type it with the code keyboard.
4. **Explain:** one sentence why it breaks. AI grades against the stored explanation (Teach It Back rubric).

**Twists:**
- **No bug:** about 1 in 5 exercises has no bug. Learner must tap "Looks correct."
- **Two bugs:** harder levels.
- **"Trust me" pushback:** Ducky argues it's fine. Learner must disagree.
- **Timed:** Daily Bug and duels.

**Bug taxonomy** (each bug is tagged so it maps to curriculum):
- `hallucinated-api`: method/function that doesn't exist
- `off-by-one`, `wrong-condition`, `missing-edge-case` (empty, null, zero)
- `missing-await`, `unhandled-promise`
- `type-coercion` (`"2" + 2`)
- `exposed-secret`, `unvalidated-input`, `injection`
- `a11y-missing-label`, `a11y-missing-alt`
- `mutation-bug`, `scope-bug`
- `overcomplicated` (not a bug: a quality issue, used in Code Review)

### Code Review
Ducky submits a "pull request": title, description (what it claims), code.

- Learner picks verdict: **Approve**, **Bug**, **Security issue**, **Overcomplicated**.
- If not approve, tap the problem line.
- About 1 in 4 PRs are genuinely fine.
- Feedback explains, and Ducky reacts in character.

### Hand Fix
- Shows broken code with the bug highlighted (or not, at higher levels).
- Learner edits the line using the **code keyboard**: standard keys plus a symbols row `{ } ( ) [ ] ; = " ' < > + - . ,` and autocomplete chips for identifiers in scope.
- Graded by: normalized match against accepted fixes (whitespace/quote-insensitive) OR running the provided tests against the edited code in a JavaScriptCore sandbox on-device (no network, timeout).

### Prompt Duel (live)
1. Goal card: "Make a button that counts clicks and resets at 10."
2. Learner writes a prompt (max 400 chars) or assembles one from chips (easier levels).
3. Backend sends it to the "very literal junior developer" prompt. Response: code, assumptions made, a question to check intent, prompt score 1 to 5, better prompt.
4. App shows code and assumptions. Learner answers "Does this do what you wanted?"
5. Reveal: prompt score and better prompt. XP scales with score.

Self-judging is fine here: the lesson is noticing the gap between what you asked and what you meant.

### Build Challenge (live, V1.1)
1. Challenge: "Build a signup form that rejects invalid emails and shows an error message."
2. Learner writes a prompt. Ducky generates a single-file HTML page (HTML + CSS + JS inline, no external network).
3. Page renders in a sandboxed `WKWebView` (JavaScript enabled, no network, no navigation).
4. The app injects the challenge's **hidden test script** and runs it:
   - Functional checks (DOM queries, simulated events, assertions)
   - Accessibility checks (axe-core bundled in-app, subset of rules)
   - Basic quality checks (no inline secrets, no `eval`)
5. Results: each requirement pass/fail, total score, attempts used. Learner can refine the prompt (each attempt costs Sparks).
6. Optional: AI rubric for "layout is reasonable" only, clearly labeled as advisory.

Challenge definitions (requirements + test script) are authored and verified in the pipeline against a known-good reference solution and known-bad solutions.

### Teach It Back (live, V1.1)
- "Explain in one or two sentences why this loop never stops."
- AI compares the answer to a stored reference explanation and rubric (key ideas that must appear, misconceptions to flag).
- Returns: pass/partial/fail, the key idea missed, one-sentence correction.
- Allowed to be AI-graded because the rubric is fixed and stored.

### Confused Client (Later)
- Ducky plays someone with a vague app idea. Learner picks (or writes) clarifying questions. Ends by choosing the best spec.

## Code X-ray (interactive, not graded)
- Step through code with a scrubber. Variables panel shows values changing. Current line highlighted.
- Execution traces are pre-computed in the pipeline (instrumented run), so the app just plays them back.

## Feedback rules (all types)
- Correct: short positive line, haptic, XP animation. Show explanation only if useful.
- Wrong: calm state, highlight the relevant line, short explanation, lose a heart (free users). Never shame.
- Every explanation is max 2 short sentences, with a "Learn more" link to the source when relevant.
