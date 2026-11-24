// Predict the Output checks (docs/07-content-pipeline.md): run the code in the
// sandbox, the real output must equal the stored answer exactly, and no
// distractor may equal it.
import type { PredictOutputPayload } from "../schemas.ts";
import type { RunResult } from "../sandbox.ts";
import { checkLineLengths } from "./text.ts";
import { fail, pass, warn, type CheckResult } from "./types.ts";

/** Option text that stands for "this code throws". */
export const ERROR_OPTION = "Error";
/** Soft cap on snippet length (docs/05-exercise-types.md: "max ~12 lines"). */
export const MAX_CODE_LINES = 12;

/**
 * How Node reports an uncaught throw on stderr: a `TypeError: ...` line for Error
 * objects, and a `node --trace-uncaught` hint for thrown non-Error values.
 */
const UNCAUGHT_ERROR = /^\w*Error\b|--trace-uncaught/m;

export type Runner =(code: string) => Promise<RunResult>;

export type ObservedOutput =
  | { ok: true; output: string; stderr: string }
  | { ok: false; reason: string };

/**
 * Turns a sandbox run into the text a learner should pick.
 * - Normal exit: stdout with the single trailing newline from the last console.log removed.
 * - Uncaught JavaScript error with nothing printed first: the literal option "Error".
 *   Node exits with code 1 and prints the error to stderr. Other non-zero exits
 *   (Docker's own 125-127, a V8 out-of-memory abort, process.exit(n)) are not
 *   "the code throws" and can't be graded.
 * - Anything else (timeout, output cut off, printed then crashed) can't be graded.
 */
export function observedOutput(run: RunResult): ObservedOutput {
  if (run.timedOut) return { ok: false, reason: "code did not finish within the time limit" };
  if (run.killed) return { ok: false, reason: "code was killed (likely the memory limit)" };
  if (run.truncated) return { ok: false, reason: "output was too large and got cut off" };
  if (run.exitCode === 0) {
    return { ok: true, output: run.stdout.replace(/\n$/, ""), stderr: run.stderr };
  }
  if (run.exitCode !== 1 || !UNCAUGHT_ERROR.test(run.stderr)) {
    const detail = run.stderr.trim().split("\n")[0];
    return {
      ok: false,
      reason: `run exited with code ${run.exitCode} without an uncaught JavaScript error${detail ? `: ${detail}` : ""}`,
    };
  }
  if (run.stdout === "") return { ok: true, output: ERROR_OPTION, stderr: run.stderr };
  return {
    ok: false,
    reason: `code printed output and then exited with code ${run.exitCode}, so there is no single right answer`,
  };
}

const show = (s: string) => JSON.stringify(s);

/** Checks that need no execution. */
export function staticChecks(payload: PredictOutputPayload): CheckResult[] {
  const results: CheckResult[] = [];

  const unique = new Set(payload.options).size === payload.options.length;
  results.push(unique ? pass("options-unique") : fail("options-unique", "two or more options are identical"));

  const lines = [
    ...payload.code.map((text, i) => ({ label: `code line ${i + 1}`, text })),
    ...payload.options.flatMap((opt, i) =>
      opt.split("\n").map((text, j, all) => ({
        label: all.length > 1 ? `option ${i + 1} line ${j + 1}` : `option ${i + 1}`,
        text,
      })),
    ),
  ];
  results.push(...checkLineLengths("line-length", lines));

  if (payload.code.length > MAX_CODE_LINES) {
    results.push(warn("code-lines", `code has ${payload.code.length} lines (aim for ${MAX_CODE_LINES} or fewer)`));
  }
  return results;
}

/** Checks that compare the stored answer against a real run. */
export function outputChecks(payload: PredictOutputPayload, run: RunResult): CheckResult[] {
  const observed = observedOutput(run);
  if (!observed.ok) return [fail("runs", observed.reason)];

  const results: CheckResult[] = [pass("runs")];
  if (observed.output !== ERROR_OPTION && observed.stderr.trim()) {
    results.push(warn("runs", `code wrote to stderr: ${observed.stderr.trim().split("\n")[0]}`));
  }

  const answer = payload.options[payload.answerIndex]!;
  results.push(
    answer === observed.output
      ? pass("output-matches-answer")
      : fail(
          "output-matches-answer",
          `stored answer (option ${payload.answerIndex + 1}) is ${show(answer)} but the code prints ${show(observed.output)}`,
        ),
  );

  const clashing = payload.options
    .map((opt, i) => ({ opt, i }))
    .filter(({ opt, i }) => i !== payload.answerIndex && opt === observed.output);
  results.push(
    clashing.length === 0
      ? pass("distractors-differ")
      : fail(
          "distractors-differ",
          `distractor ${clashing.map(({ i }) => `option ${i + 1}`).join(", ")} equals the real output ${show(observed.output)}`,
        ),
  );
  return results;
}

export async function checkPredictOutput(
  payload: PredictOutputPayload,
  language: string,
  run: Runner,
): Promise<CheckResult[]> {
  const results = staticChecks(payload);
  if (language !== "javascript") {
    results.push(fail("runs", `can't execute language "${language}" yet (only javascript)`));
    return results;
  }
  let result: RunResult;
  try {
    result = await run(payload.code.join("\n"));
  } catch (e) {
    results.push(fail("runs", `sandbox error: ${e instanceof Error ? e.message : String(e)}`));
    return results;
  }
  results.push(...outputChecks(payload, result));
  return results;
}
