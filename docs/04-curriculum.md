# Curriculum

## Philosophy

- **Understanding over syntax.** Learners should be able to explain why code works, not just recognize it.
- **Hand + AI, always together.** Every unit follows the 4-step rhythm below.
- **Grounded in real standards.** Every lesson cites the source it is based on.
- **Bite-sized.** A lesson is 3 to 8 minutes. A unit is 5 to 8 lessons plus a checkpoint.
- **Web first.** JavaScript, HTML, and CSS are the primary languages for v1 because most AI-built apps are web apps and learner builds can render in-app. Python comes later.

## The 4-step unit rhythm

Every unit is built around one concept and follows this arc:

1. **Learn it by hand.** Small tap-based exercises: predict output, fill the blank, order steps, tap the line.
2. **Direct the AI.** Prompt Ducky to produce something that uses the concept (Prompt Duel, pick-the-better-prompt).
3. **Check the AI.** Spot the Bug and Code Review on AI-written code that uses the concept.
4. **Fix it by hand.** Correct the bug or extend the code yourself with the code keyboard.

A unit ends with a **checkpoint** (mixed review). Later, units end with a **boss level** (mini build).

## Standards sources

| Area | Source |
|---|---|
| HTML, CSS, JavaScript, Web APIs, HTTP | MDN Web Docs |
| Accessibility | WCAG 2.2 |
| Security | OWASP Top 10, OWASP Cheat Sheet Series |
| JavaScript style | Consistent lint rules (ESLint recommended config) |
| Python (later) | Official Python docs, PEP 8 |
| Swift (later) | Swift.org docs, Swift API Design Guidelines |
| Git | Official Git documentation |

Lessons link to sources. They never copy source text verbatim.

## Tracks

### Track 1: Foundations (free core)
1. **How code runs:** instructions, order, the idea of a program
2. **Values and variables:** strings, numbers, booleans, `let`/`const`
3. **Decisions:** `if`/`else`, comparison, truthy/falsy
4. **Repetition:** loops, off-by-one, infinite loops
5. **Functions:** inputs, outputs, return vs log
6. **Collections:** arrays, objects, JSON
7. **Checkpoint: read a whole program**

### Track 2: How AI writes code (core differentiator)
1. **How AI actually works:** tokens, context, prediction, why it sounds confident when wrong
2. **Hallucinations in code:** made-up functions, outdated APIs, invented packages
3. **Asking well:** turning a fuzzy idea into a clear spec, constraints, examples
4. **Breaking work down:** small steps, one change at a time
5. **Giving context:** what to tell the AI about your project
6. **Iterating:** reading the output, asking for targeted fixes instead of "fix it"

### Track 3: Reading and reviewing AI code
1. **Skimming code you didn't write:** structure first, details later
2. **Tracing:** following values through a function
3. **Spotting logic bugs:** edge cases, empty inputs, off-by-one
4. **Spotting overcomplication:** when 40 lines should be 5
5. **Async basics:** promises, `await`, why data shows up empty
6. **Code review habits:** what to check every time

### Track 4: How apps work
1. **Frontend vs backend**
2. **HTML structure and semantics**
3. **CSS layout basics** (flexbox)
4. **The DOM and events** (buttons, forms)
5. **HTTP and APIs:** requests, responses, status codes, JSON
6. **Databases:** tables, rows, queries, why you need one
7. **Auth:** what login actually does

### Track 5: Debugging
1. **Reading error messages**
2. **Stack traces**
3. **Console logging and inspecting values**
4. **Reproducing a bug**
5. **Asking AI for a targeted fix** (with the error, the code, what you expected)

### Track 6: Security for vibe coders
1. **Secrets:** API keys, environment variables, why keys never go in frontend code
2. **Input validation**
3. **Injection** (SQL, HTML/XSS) at a conceptual level
4. **Auth mistakes:** trusting the client, missing permission checks
5. **Database access rules** (row-level security concept)
6. **Dependencies:** what packages are, why AI-suggested packages can be fake or malicious

### Track 7: Shipping
1. **Git basics:** commit, history, undo
2. **Branches** and why you try changes safely
3. **Deploying a site**
4. **Environment variables in production**
5. **Domains and HTTPS**

### Later tracks
- Payments (Stripe concepts, webhooks)
- AI agents and automation (APIs, MCP concepts)
- Python foundations
- Building iOS apps with AI (Swift)
- Tool tracks: Cursor, Claude Code, Lovable, Replit workflows (candidates for sponsorship)

## MVP scope

Launch with:
- **Track 1** units 1 to 4 (free)
- **Track 2** units 1 to 3
- **Track 3** units 1 and 3
- **Track 6** unit 1 (secrets)

That is roughly 10 units, 60 lessons. Quality over quantity.

## Unit 1 detailed outline (template for all units)

**Unit: Values and variables (Track 1, Unit 2)**

| Lesson | Exercises (types) | Goal |
|---|---|---|
| 1. What is a variable | concept check, predict output x4, fill blank x3 | A variable is a named box for a value |
| 2. Changing values | predict output x5, order steps x2, tap the line x2 | Reassignment, `let` vs `const` |
| 3. Types of values | multiple choice x3, predict output x4 (string + number gotchas) | Strings vs numbers, `"2" + 2` |
| 4. Ask Ducky | pick the better prompt x3, Prompt Duel x1 | Directing AI to write variable code clearly |
| 5. Catch Ducky | Spot the Bug x4, Code Review x2 | AI mistakes with variables (const reassignment, wrong type) |
| 6. Fix it yourself | hand-fix with code keyboard x4 | Correct bugs by typing small fixes |
| Checkpoint | mixed x12 | Mastery check, earns unit badge |

Each lesson record includes: id, title, track, unit, concept tags, `basedOn` sources, ordered exercise list (static ids or pool references). See `12-data-models.md`.
