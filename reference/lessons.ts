// REFERENCE SKETCH ONLY. Early prototype from the planning phase. Not production code.
// The real backend lives in backend/supabase/functions and follows docs/06-ai-system.md.

// lessons.ts
// AI-powered lesson types for the "learn to code with AI" app.
// Runs on YOUR backend (never ship the API key in the iOS app).
//
// Cost strategy:
//   1. Spot the Bug + Code Review: pre-generate big pools with the Batch API (50% off),
//      store them in your DB, serve instantly. Live calls are only a fallback.
//   2. Prompt Duel: must be live (depends on what the user typed), so keep it tiny.
//   3. Every call uses forced tool use -> structured JSON, short outputs, no chatty text.
//   4. Static system prompts are marked for prompt caching.
//
// npm i @anthropic-ai/sdk

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
const MODEL = "claude-haiku-5-5";

// ---------------------------------------------------------------------------
// Shared types (mirror these as Codable structs in Swift)
// ---------------------------------------------------------------------------

export type Language = "javascript" | "python" | "swift";

export interface SpotTheBug {
  concept: string;          // e.g. "loop off-by-one"
  language: Language;
  task: string;             // what the code is SUPPOSED to do, one sentence
  code: string[];           // one string per line, so the app can render tappable lines
  bugLine: number;          // 0-based index into code[]
  explanation: string;      // shown after the user answers, max ~2 sentences
  fixedLine: string;        // corrected version of the buggy line
}

export interface PromptDuel {
  code: string[];
  assumptions: string[];    // gaps the AI had to guess because the prompt was vague
  matchesIntentQuestion: string; // question shown to the user, e.g. "Does this reset at 10?"
  promptScore: number;      // 1-5, how clear the user's prompt was
  betterPrompt: string;     // an improved version of the user's prompt
}

export interface CodeReview {
  language: Language;
  prTitle: string;          // the "teammate's" pull request title
  prDescription: string;    // what the teammate claims the code does
  code: string[];
  verdict: "approve" | "bug" | "security" | "overcomplicated";
  problemLine: number | null; // null when verdict is "approve"
  explanation: string;
}

// ---------------------------------------------------------------------------
// Tool schemas (forcing a tool call = guaranteed structured output)
// ---------------------------------------------------------------------------

const spotTheBugTool: Anthropic.Tool = {
  name: "spot_the_bug",
  description: "Return one beginner-friendly spot-the-bug exercise.",
  input_schema: {
    type: "object",
    properties: {
      concept: { type: "string" },
      language: { type: "string", enum: ["javascript", "python", "swift"] },
      task: { type: "string" },
      code: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 12 },
      bugLine: { type: "integer", minimum: 0 },
      explanation: { type: "string" },
      fixedLine: { type: "string" },
    },
    required: ["concept", "language", "task", "code", "bugLine", "explanation", "fixedLine"],
  },
};

const promptDuelTool: Anthropic.Tool = {
  name: "prompt_duel",
  description: "Return the code produced from the learner's prompt plus feedback.",
  input_schema: {
    type: "object",
    properties: {
      code: { type: "array", items: { type: "string" }, maxItems: 20 },
      assumptions: { type: "array", items: { type: "string" }, maxItems: 4 },
      matchesIntentQuestion: { type: "string" },
      promptScore: { type: "integer", minimum: 1, maximum: 5 },
      betterPrompt: { type: "string" },
    },
    required: ["code", "assumptions", "matchesIntentQuestion", "promptScore", "betterPrompt"],
  },
};

const codeReviewTool: Anthropic.Tool = {
  name: "code_review",
  description: "Return one pull request for the learner to review.",
  input_schema: {
    type: "object",
    properties: {
      language: { type: "string", enum: ["javascript", "python", "swift"] },
      prTitle: { type: "string" },
      prDescription: { type: "string" },
      code: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 15 },
      verdict: { type: "string", enum: ["approve", "bug", "security", "overcomplicated"] },
      problemLine: { type: ["integer", "null"] },
      explanation: { type: "string" },
    },
    required: ["language", "prTitle", "prDescription", "code", "verdict", "problemLine", "explanation"],
  },
};

// ---------------------------------------------------------------------------
// System prompts (static, so they can be cached)
// ---------------------------------------------------------------------------

const SPOT_THE_BUG_SYSTEM = `You create "spot the bug" exercises for beginners learning to code with AI.
Rules:
- The code must look like something an AI assistant would plausibly write.
- Exactly ONE line contains the bug, and the bug must relate to the given concept.
- The bug must be visible by reading, not by running (no typos, no missing imports).
- Keep code short: 3 to 12 lines, no comments that give away the answer.
- "task" describes what the code is supposed to do in plain English.
- "explanation" is max 2 short sentences, friendly, no jargon without explaining it.
- bugLine is a 0-based index into the code array.`;

const PROMPT_DUEL_SYSTEM = `You are a very literal junior developer. A beginner gives you a request.
Rules:
- Write code that does EXACTLY what the request says, nothing more.
- If something is unclear, make a simple guess and list it in "assumptions" (max 4, short).
- Never ask questions back. Never add features the user did not ask for.
- "matchesIntentQuestion" asks the learner to check one thing your code assumed.
- "promptScore": 5 means nothing had to be guessed, 1 means almost everything was guessed.
- "betterPrompt" rewrites their request so a literal developer would get it right. Max 2 sentences.
- Code max 20 lines, beginner-readable.`;

const CODE_REVIEW_SYSTEM = `You play a teammate submitting a small pull request for review.
Rules:
- About 1 in 4 PRs should be genuinely fine (verdict "approve", problemLine null).
- Otherwise include ONE clear issue: a logic bug, a security problem (for example an exposed API key
  or unsanitized input), or needless complexity.
- prDescription is what the teammate CLAIMS the code does, written casually.
- Keep code 4 to 15 lines, beginner-readable. explanation max 2 sentences.`;

// ---------------------------------------------------------------------------
// Helper: one forced-tool call with caching and a small output budget
// ---------------------------------------------------------------------------

async function callTool<T>(
  system: string,
  tool: Anthropic.Tool,
  userText: string,
  maxTokens: number
): Promise<T> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
    messages: [{ role: "user", content: userText }],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("No structured output returned");
  return block.input as T;
}

// ---------------------------------------------------------------------------
// 1. Spot the Bug (live fallback; normally served from the pre-generated pool)
// ---------------------------------------------------------------------------

export async function generateSpotTheBug(concept: string, language: Language): Promise<SpotTheBug> {
  const ex = await callTool<SpotTheBug>(
    SPOT_THE_BUG_SYSTEM,
    spotTheBugTool,
    `Concept: ${concept}\nLanguage: ${language}`,
    500
  );
  if (ex.bugLine < 0 || ex.bugLine >= ex.code.length) throw new Error("Invalid bugLine, regenerate");
  return ex;
}

// ---------------------------------------------------------------------------
// 2. Prompt Duel (always live, costs ~1 Spark)
// ---------------------------------------------------------------------------

export async function runPromptDuel(userPrompt: string, language: Language): Promise<PromptDuel> {
  const trimmed = userPrompt.slice(0, 400); // hard cap on input size
  return callTool<PromptDuel>(
    PROMPT_DUEL_SYSTEM,
    promptDuelTool,
    `Language: ${language}\nRequest: ${trimmed}`,
    700
  );
}

// ---------------------------------------------------------------------------
// 3. Code Review (live fallback; normally served from the pool)
// ---------------------------------------------------------------------------

export async function generateCodeReview(topic: string, language: Language): Promise<CodeReview> {
  const pr = await callTool<CodeReview>(
    CODE_REVIEW_SYSTEM,
    codeReviewTool,
    `Topic: ${topic}\nLanguage: ${language}`,
    600
  );
  if (pr.verdict !== "approve" && (pr.problemLine === null || pr.problemLine >= pr.code.length)) {
    throw new Error("Invalid problemLine, regenerate");
  }
  return pr;
}

// ---------------------------------------------------------------------------
// Pool filling with the Batch API (50% cheaper). Run nightly or on demand.
// ---------------------------------------------------------------------------

export async function submitSpotTheBugBatch(
  concepts: string[],
  language: Language,
  variantsPerConcept = 25
) {
  const requests = concepts.flatMap((concept, ci) =>
    Array.from({ length: variantsPerConcept }, (_, vi) => ({
      custom_id: `stb-${language}-${ci}-${vi}`,
      params: {
        model: MODEL,
        max_tokens: 500,
        system: SPOT_THE_BUG_SYSTEM,
        tools: [spotTheBugTool],
        tool_choice: { type: "tool" as const, name: spotTheBugTool.name },
        messages: [
          {
            role: "user" as const,
            // Variant number nudges the model toward different scenarios
            content: `Concept: ${concept}\nLanguage: ${language}\nVariant: ${vi + 1} (use a different real-world scenario than usual)`,
          },
        ],
      },
    }))
  );

  const batch = await client.messages.batches.create({ requests });
  return batch.id; // poll later, then validate each result and insert into your DB
}

// ---------------------------------------------------------------------------
// Spark gate (call before any live AI request)
// ---------------------------------------------------------------------------

export interface SparkStore {
  getBalance(userId: string): Promise<number>;
  spend(userId: string, amount: number): Promise<void>;
}

export async function withSpark<T>(
  store: SparkStore,
  userId: string,
  cost: number,
  fn: () => Promise<T>
): Promise<T> {
  if ((await store.getBalance(userId)) < cost) throw new Error("OUT_OF_SPARKS"); // show paywall / packs
  const result = await fn();
  await store.spend(userId, cost); // only charge on success
  return result;
}
