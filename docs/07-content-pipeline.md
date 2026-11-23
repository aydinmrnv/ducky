# Content pipeline

The pipeline is how Ducky avoids AI slop. AI drafts content cheaply. **Code execution, linters, and the owner's review decide what ships.**

## Overview

```
authored specs (content/) ──► generate (Batch API) ──► verify (sandbox run, lint, a11y) ──► review sample ──► publish pack (Supabase Storage)
                                         ▲                         │
                                         └──── rejected, regenerate┘
```

Runs locally on a Mac: `pipeline/` is a TypeScript CLI.

```
pnpm pipeline generate --unit t1-u2 --type spot-the-bug --count 25
pnpm pipeline verify   --batch <batchId>
pnpm pipeline review   --unit t1-u2          # opens a local review UI / prints samples
pnpm pipeline publish  --unit t1-u2 --version 3
```

## Inputs: authored content (`content/`)

Authored by the owner (with AI help), reviewed in git:

```
content/
├── tracks.json
├── units/t1-u2.json            # unit metadata, concepts, basedOn sources
├── lessons/t1-u2-l1.json       # lesson: ordered exercise refs
├── exercises/static/...        # hand-authored static exercises
├── challenges/build/...        # Build Challenge definitions + tests + reference solutions
└── generation/specs/t1-u2.json # what to generate: concepts, bug types, counts, language
```

## Step 1: Generate

- Uses the strong model through the Batch API (50% off).
- One request per variant, with concept, bug type, language, difficulty, and a variant number to push diversity.
- Same structured schemas as the app (`12-data-models.md`). The pipeline imports the shared schema package.

### Spot the Bug generation prompt (v1)

```
You create "spot the bug" exercises for beginners learning to code with AI.
Concept: {{concept}}. Bug type: {{bugType}}. Language: {{language}}. Difficulty: {{difficulty}}.
Rules:
- The code must look like something an AI assistant would plausibly write.
- Exactly ONE line contains the bug (unless bugType is "none"), and it must match the bug type.
- The bug must be visible by reading. No typos, no missing imports.
- 3 to 12 lines. Max 38 characters per line where possible (phone width).
- No comments that give the answer away.
- Provide: task (what it should do), code lines, bugLine (0-based), diagnosis options (1 correct + 3 plausible wrong),
  fix options (1 correct + 2 wrong), the corrected full code, a test harness that passes for the fixed code and fails for the buggy code,
  and a 2-sentence explanation.
- Variant {{n}}: use a different realistic scenario than other variants (shopping cart, game score, form, todo list, chat, weather...).
```

## Step 2: Verify (the important part)

Every generated item runs through automated checks in a **Docker sandbox** (no network, CPU and memory limits, 5 second timeout).

### Checks by type

| Type | Checks |
|---|---|
| Predict the Output | Run code, capture stdout. Must equal the stored answer exactly. Distractors must NOT equal the real output. |
| Spot the Bug | Buggy code + test harness: tests must FAIL. Fixed code + same harness: tests must PASS. The diff between buggy and fixed must be on `bugLine` only. Correct fix option must equal the fixed line. Wrong fix options must fail the tests. |
| Spot the Bug (no-bug variant) | Code passes tests. |
| Code Review | Same as Spot the Bug for bug/security verdicts. Security verdicts also checked by a rule (for example, a secret-like string pattern present, unescaped input reaches `innerHTML` or a query). Approve verdicts must pass tests and lint. |
| Hand Fix | Every accepted answer passes tests. |
| Build Challenge definition | Reference solution passes all tests. Each known-bad solution fails at least one specific test. axe-core runs in Playwright. |
| Code X-ray | Instrumented run produces a trace; trace stored. |

### Quality gates (all types)
- **Lint:** ESLint (recommended config + project rules). Code meant to be "correct" must have zero lint errors. Buggy code may only violate the intended rule.
- **Length:** lines and character limits for phone display.
- **Language:** plain English explanations, max 2 sentences, reading level check (simple heuristic).
- **Dedup:** reject items too similar to existing ones (normalized code hash + embedding similarity, optional).
- **Banned content:** no real API keys (generate obvious fake ones like `sk_test_FAKE123`), no real people, no brand names in examples.

### Results
- Each item gets `verification: { passed: bool, checks: [...], verifiedAt, pipelineVersion }`.
- Failed items are dropped and logged with the failing check. Track failure rates per bug type to improve prompts.

## Step 3: Review

- The owner reviews a random sample (at least 10% per unit, 100% for the first two units) in a simple local review tool: shows the exercise rendered roughly as in the app, approve/reject/edit.
- Rejections feed back into prompt improvements.
- Every item records `reviewedBy` and `reviewedAt` when reviewed.

## Step 4: Publish

- Items for a unit are bundled into a **content pack**: `packs/t1-u2/v3.json` (gzip), plus a manifest with version, item counts, and checksum.
- Uploaded to Supabase Storage (public read, signed URLs not required since content is not sensitive).
- `content_packs` table records the latest version per unit. The app checks the manifest and downloads new versions in the background.
- The first unit(s) are also bundled in the app binary so onboarding works offline.

## Pool sizing

- Target per unit: 25 to 50 Spot the Bug, 15 Code Review, 30 Predict Output, 15 Hand Fix.
- A learner should rarely see a repeat. The app tracks seen item ids and serves unseen ones first.
- If a learner exhausts a pool, use the live fallback: generate with Haiku, run lightweight on-device checks where possible, flag as `unverified` in analytics, and queue it for pipeline verification. (Never shown in the Daily Bug or graded checkpoints.)

## Cost estimate

A unit of ~120 generated items with a strong model via Batch API costs roughly $1 to $5 depending on the model. The full MVP curriculum (10 units) is under $50 to generate, likely much less. Regenerations included.
