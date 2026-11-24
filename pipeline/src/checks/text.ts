// Checks on text shown to learners: phone-width line length and explanation length.
import { fail, pass, warn, type CheckResult } from "./types.ts";

/** Phone-width target (docs/11-design.md). Lines above this get a warning. */
export const LINE_WARN_CHARS = 38;
/** Hard limit. Lines above this fail verification. */
export const LINE_FAIL_CHARS = 48;
export const MAX_EXPLANATION_SENTENCES = 2;

/** Length in user-perceived characters, so emoji and accents count as one. */
export function displayLength(s: string): number {
  return [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(s)].length;
}

/**
 * Checks every line against the length limits. `lines` are labelled so the
 * report can say where the problem is, e.g. "code line 3".
 */
export function checkLineLengths(id: string, lines: { label: string; text: string }[]): CheckResult[] {
  const failures: string[] = [];
  const warnings: string[] = [];
  for (const { label, text } of lines) {
    const len = displayLength(text);
    if (len > LINE_FAIL_CHARS) failures.push(`${label} is ${len} chars (max ${LINE_FAIL_CHARS})`);
    else if (len > LINE_WARN_CHARS) warnings.push(`${label} is ${len} chars (aim for ${LINE_WARN_CHARS} or fewer)`);
  }
  const results: CheckResult[] = [];
  if (failures.length) results.push(fail(id, failures.join("; ")));
  else results.push(pass(id));
  if (warnings.length) results.push(warn(id, warnings.join("; ")));
  return results;
}

/** Abbreviations whose trailing dot doesn't end a sentence. */
const ABBREVIATIONS = /\b(?:e\.g|i\.e|etc|vs|approx)\./gi;

/**
 * Counts sentences with a simple heuristic: a run of `.`, `!` or `?` followed by
 * whitespace or the end of the text ends a sentence. Dots inside code such as
 * `items.length` or `3.5` are not followed by a space, so they don't count.
 * Common abbreviations (e.g., i.e., etc.) are ignored. Text with no terminator
 * at all counts as one sentence.
 */
export function countSentences(text: string): number {
  const trimmed = text.trim().replace(ABBREVIATIONS, "abbr");
  if (!trimmed) return 0;
  const terminators = trimmed.match(/[.!?]+(?=\s|$)/g)?.length ?? 0;
  const endsWithTerminator = /[.!?]$/.test(trimmed);
  return endsWithTerminator ? terminators : terminators + 1;
}

export function checkExplanation(field: string, text: string): CheckResult {
  const id = `${field}-length`;
  const n = countSentences(text);
  return n <= MAX_EXPLANATION_SENTENCES
    ? pass(id)
    : fail(id, `${field} has ${n} sentences (max ${MAX_EXPLANATION_SENTENCES})`);
}
