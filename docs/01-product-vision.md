# Product vision

## One sentence

Ducky teaches people to build software with AI and actually understand what the AI built, in five minutes a day, on their phone.

## The problem

1. **AI writes most new code for beginners now.** People build apps with Cursor, Claude Code, Lovable, Replit, v0, and ChatGPT without being able to read the result.
2. **When it breaks, they are stuck.** They can't read error messages, find the broken line, judge whether the AI's fix is right, or spot that the AI just exposed their API key.
3. **Learn-to-code apps haven't caught up.** They teach syntax the old way, often by typing code on a phone keyboard, or they add an AI chatbot on the side of traditional lessons.
4. **AI tutors produce slop.** Learners don't trust AI-generated explanations, and they're right not to when nothing is verified.

## The solution

A Duolingo-style app where:
- **You learn by reading and judging code**, not by memorizing syntax.
- **The AI is the exercise.** It writes code (sometimes wrong on purpose), and you catch the mistakes, review its work, and direct it to build things that get graded by real tests.
- **Hand coding and AI coding are taught together**, because that's how real developers work now.
- **Every answer is verified** by running the code and checking it against real standards.

## Who it's for

**Primary (leaning, see open questions):**
- **AI-curious beginners:** have used ChatGPT, want to build something, never coded.
- **Vibe coders:** have built something with AI tools, feel lost when it breaks, want to understand it.

**Secondary:**
- Students taking CS classes who want intuition, not just syntax.
- Non-technical founders and PMs who direct AI or developers.

**Not for (v1):** experienced developers looking for advanced material, interview prep, kids under 13.

## What success looks like for a learner

After the core path, a learner can:
1. Read a short piece of code and explain what it does.
2. Write a clear request (spec) that gets an AI to build the right thing.
3. Review AI-written code and catch bugs, security holes, and overcomplication.
4. Read an error message and find the cause.
5. Explain how a web app fits together: frontend, backend, database, API.
6. Avoid the classic vibe-coding disasters: leaked keys, no input validation, no backups, no version control.
7. Ship a small app built with AI, and understand every part of it.

## Competitors (researched November 2026)

| App | What it does | Price signal | How Ducky differs |
|---|---|---|---|
| **Coddy** | Markets itself as "Duolingo for coding." 18+ languages, AI tutor "Bugsy," prompt engineering, token packs. | Plus/Pro subscriptions, Pro monthly up to $19.99, token packs | Its AI is a helper; Ducky's AI is the exercise. Coddy has you type code on your phone. Ducky is tap-first and far cheaper. |
| **Mimo** | Largest coding app, moving toward AI-assisted building and careers. | Pro up to $79.99/year | Mimo teaches writing code. Ducky teaches directing and checking AI. |
| **Sololearn** | Casual coding lessons, AI assistant "Kodie," separate "Learn AI" app for prompting. | Pro/Max tiers | Prompting is separate from coding there. Ducky combines them. |
| **Brilliant** | Interactive problem solving, "Thinking in Code," strong on understanding over syntax. | Premium subscription | Brilliant teaches CS thinking. Ducky teaches building with AI tools specifically. |
| **Codecademy** | Web courses, now has an "AI Builder" for working with AI-generated code. | Premium subscription | Desktop-first. Ducky is mobile-native and bite-sized. |
| **Indie "understand your AI code" tools** | Vibely, vibecheck, UnVibe, redoCebiv | Small, early | They assume developer knowledge. Ducky starts from zero. |
| **Duolingo** | Has considered coding, launched math, music, chess instead. | n/a | The biggest risk if they ever enter. Move fast. |

## Positioning

**For** people who build (or want to build) with AI **who** feel lost when the code breaks, **Ducky is** a bite-sized learning app **that** teaches you to direct, read, and check AI-written code. **Unlike** Coddy or Mimo, the AI in Ducky is the exercise itself, every answer is verified by running real code, and it costs $4.99/month.

## Key selling points (use in marketing)

1. "Learn to build with AI, and actually understand what it built."
2. "You never type code on your phone." (Tap-first.)
3. "Every answer is run and checked against real standards." (No AI slop.)
4. "Catch the AI's mistakes." (Ducky writes buggy code on purpose.)
5. "$4.99/month." (Cheapest serious option.)

## Risks

| Risk | Mitigation |
|---|---|
| Coddy or Mimo copies the exercise types | Move fast, build the verification pipeline (hard to copy), build an audience early with puzzle content |
| Lesson quality is weak, retention suffers | Owner reviews content, verification pipeline, start with one excellent unit |
| AI costs exceed revenue | Pre-generated pools, Spark caps, cheap models, on-device model for free hints |
| Duolingo enters coding | Niche positioning (AI-assisted building), community, speed |
| Low downloads | Marketing starts before launch, see `16-marketing.md` |
