# Data models

Source of truth for shapes. Backend uses zod schemas generated from/consistent with these, iOS mirrors them as `Codable` structs. Field names are camelCase in JSON. Database columns are snake_case.

## Content

### Track
```json
{ "id": "t1", "title": "Foundations", "summary": "How code works", "order": 1, "isFree": true, "unitIds": ["t1-u1", "t1-u2"] }
```

### Unit
```json
{
  "id": "t1-u2",
  "trackId": "t1",
  "title": "Values and variables",
  "concepts": ["variables", "reassignment", "types"],
  "basedOn": [{ "label": "MDN: Variables", "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables" }],
  "lessonIds": ["t1-u2-l1", "t1-u2-l2"],
  "checkpointLessonId": "t1-u2-cp"
}
```
(Verify every `basedOn` URL resolves before publishing; the pipeline checks links.)

### Lesson
```json
{
  "id": "t1-u2-l5",
  "unitId": "t1-u2",
  "title": "Catch Ducky",
  "step": "checkAI",                 // learnByHand | directAI | checkAI | fixByHand | checkpoint
  "estimatedMinutes": 5,
  "exercises": [
    { "kind": "static", "id": "ex_8f2a" },
    { "kind": "pool", "pool": "spotTheBug", "concept": "variables", "difficulty": 1 },
    { "kind": "live", "type": "promptDuel", "goalId": "goal_counter_reset" }
  ]
}
```

### Common exercise envelope
Every exercise item:
```json
{
  "id": "stb_t1u2_0017",
  "type": "spotTheBug",
  "unitId": "t1-u2",
  "concepts": ["variables"],
  "difficulty": 1,
  "language": "javascript",
  "basedOn": [{ "label": "MDN: const", "url": "..." }],
  "explanation": "const can't be reassigned. Use let when a value changes.",
  "altExplanation": "A const is locked after you set it. Since the score goes up, it needs let.",
  "verification": { "passed": true, "checks": ["tests-fail-buggy", "tests-pass-fixed", "lint"], "verifiedAt": "2026-12-01T10:00:00Z", "pipelineVersion": "1.0.0" },
  "payload": { }
}
```

### Payloads by type

**predictOutput**
```json
{ "code": ["let a = \"2\";", "let b = 2;", "console.log(a + b);"], "options": ["4", "22", "\"2\"2", "Error"], "answerIndex": 1 }
```

**tapTheLine**
```json
{ "prompt": "Tap the line that makes the counter start at 1.", "code": ["..."], "answerLines": [0] }
```

**fillBlank**
```json
{ "code": ["let total = 0;", "for (let i = 0; i {{0}} items.length; i++) {"], "blanks": [{ "accepted": ["<"] }], "wordBank": ["<", "<=", ">", "=="] }
```

**orderSteps**
```json
{ "prompt": "Put these in order.", "items": ["...", "..."], "correctOrder": [2, 0, 1, 3] }
```

**multipleChoice**
```json
{ "prompt": "...", "options": ["...", "..."], "answerIndex": 0 }
```

**pickBetterPrompt**
```json
{ "goal": "A button that counts clicks and resets at 10", "options": ["make a counter", "Make a button labeled Count. Each tap adds 1 to a number shown above it. When it reaches 10, reset to 0."], "answerIndex": 1, "whyBetter": "It says what to show, what happens on tap, and the exact reset rule." }
```

**spotTheBug**
```json
{
  "task": "Add up the price of every item in the cart.",
  "code": ["function cartTotal(items) {", "  let total = 0;", "  for (let i = 1; i < items.length; i++) {", "    total += items[i].price;", "  }", "  return total;", "}"],
  "hasBug": true,
  "bugLines": [2],
  "bugType": "off-by-one",
  "diagnosisOptions": ["Skips the first item", "Adds prices as text", "Never returns", "Loops forever"],
  "diagnosisAnswerIndex": 0,
  "fixOptions": ["  for (let i = 0; i < items.length; i++) {", "  for (let i = 1; i <= items.length; i++) {", "  for (let i = 0; i <= items.length; i++) {"],
  "fixAnswerIndex": 0,
  "fixedCode": ["..."],
  "ducky": { "claim": "Trust me, this totals the cart.", "caughtLine": "Ok fine. I skipped the first item." }
}
```

**codeReview**
```json
{
  "prTitle": "Add API call for weather",
  "prDescription": "Fetches the weather and shows it. Works great!",
  "code": ["..."],
  "verdict": "security",            // approve | bug | security | overcomplicated
  "problemLines": [1],
  "explanation": "The API key is in frontend code, so anyone can copy it. Keep keys on a server."
}
```

**handFix**
```json
{ "code": ["..."], "editableLine": 2, "showBugHighlight": true, "acceptedFixes": ["for (let i = 0; i < items.length; i++) {"], "tests": "/* JS test source run in JavaScriptCore */" }
```

**buildChallenge (definition)**
```json
{
  "id": "bc_signup_email",
  "title": "Signup form",
  "brief": "Build a signup form that rejects invalid emails and shows an error message.",
  "requirements": [
    { "id": "r1", "label": "Has an email input with a label" },
    { "id": "r2", "label": "Shows an error for an invalid email" },
    { "id": "r3", "label": "No error for a valid email" }
  ],
  "testScript": "/* injected JS, reports results via webkit.messageHandlers.results.postMessage */",
  "axeRules": ["label", "button-name", "color-contrast"],
  "sparkCost": 3,
  "maxAttempts": 5
}
```

**teachItBack**
```json
{ "question": "Why does this loop never stop?", "code": ["..."], "referenceExplanation": "...", "keyIdeas": ["i never changes", "condition stays true"], "misconceptions": ["the loop is too long"] }
```

## Live AI responses

**PromptDuelResponse**
```json
{ "code": ["..."], "assumptions": ["Reset goes back to 0"], "matchesIntentQuestion": "Did you want it to reset to 0 or 1?", "promptScore": 3, "betterPrompt": "...", "promptVersion": "prompt-duel.v1" }
```

**BuildResponse**
```json
{ "html": "<!doctype html>...", "promptVersion": "build.v1", "attempt": 2, "sparksRemaining": 41 }
```

**TeachItBackResponse**
```json
{ "result": "partial", "missingIdea": "i never changes", "correction": "The loop needs i to grow each time, or the condition stays true forever." }
```

## User data (Postgres)

| Table | Key columns |
|---|---|
| `profiles` | `id (uuid, = auth.users.id)`, `display_name`, `experience_level`, `goal`, `daily_goal_minutes`, `timezone`, `created_at` |
| `lesson_progress` | `user_id`, `lesson_id`, `completed_at`, `xp`, `accuracy` |
| `exercise_attempts` | `user_id`, `exercise_id`, `type`, `correct`, `time_ms`, `created_at` |
| `seen_items` | `user_id`, `item_id`, `seen_at` |
| `streaks` | `user_id`, `current`, `longest`, `last_active_date`, `freezes` |
| `xp_events` | `user_id`, `amount`, `reason`, `created_at` |
| `spark_ledger` | `id`, `user_id`, `delta (int)`, `reason`, `ref_id`, `created_at` (append-only) |
| `purchases` | `user_id`, `product_id`, `original_transaction_id`, `type`, `expires_at`, `status`, `environment` |
| `entitlements` (view) | computed: `is_paid`, `plan`, `expires_at` |
| `ai_calls` | `id`, `user_id`, `use_case`, `provider`, `model`, `input_tokens`, `output_tokens`, `cost_usd`, `latency_ms`, `success`, `prompt_version`, `created_at` |
| `daily_bugs` | `date (pk)`, `item_id` |
| `daily_bug_results` | `user_id`, `date`, `solved`, `time_ms` |
| `referrals` | `inviter_id`, `invitee_id`, `status`, `created_at` |
| `content_packs` | `unit_id`, `version`, `path`, `checksum`, `item_count`, `published_at` |
| `leagues` (V1.1) | `week`, `tier`, `user_id`, `xp` |

## Spark reasons (enum)
`daily_grant`, `monthly_grant`, `purchase`, `referral_inviter`, `referral_invitee`, `streak_bonus`, `unit_complete`, `spend_pool`, `spend_prompt_duel`, `spend_teach_back`, `spend_build`, `refund`, `admin_adjust`.
