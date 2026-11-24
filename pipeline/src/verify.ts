// Verifies exercise items: schema, shared quality gates, and per-type checks.
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import { LinkChecker } from "./checks/links.ts";
import { checkPredictOutput, type Runner } from "./checks/predictOutput.ts";
import { checkTapTheLine } from "./checks/tapTheLine.ts";
import { checkExplanation } from "./checks/text.ts";
import { fail, pass, type CheckResult } from "./checks/types.ts";
import { ExerciseEnvelopeSchema, ExerciseSchema, isVerifiableType } from "./schemas.ts";

export interface VerifyDeps {
  run: Runner;
  links: LinkChecker;
}

export interface ItemReport {
  file: string;
  /** Position in the file when the file holds an array of items. */
  index?: number;
  id: string;
  type: string;
  passed: boolean;
  results: CheckResult[];
}

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.length ? i.path.join(".") : "(root)"}: ${i.message}`)
    .join("; ");
}

/** Runs every check that applies to one raw (unparsed) item. */
export async function verifyItem(raw: unknown, deps: VerifyDeps): Promise<CheckResult[]> {
  const envelope = ExerciseEnvelopeSchema.safeParse(raw);
  if (!envelope.success) return [fail("schema", formatZodError(envelope.error))];

  const { type } = envelope.data;
  if (!isVerifiableType(type)) {
    return [fail("schema", `no verifier for exercise type "${type}" yet, so it can't be published`)];
  }

  const parsed = ExerciseSchema.safeParse(raw);
  if (!parsed.success) return [fail("schema", formatZodError(parsed.error))];
  const item = parsed.data;

  const results: CheckResult[] = [pass("schema")];
  results.push(checkExplanation("explanation", item.explanation));
  if (item.altExplanation !== undefined) results.push(checkExplanation("altExplanation", item.altExplanation));

  const [linkResult, typeResults] = await Promise.all([
    deps.links.check(item.basedOn.map((b) => b.url)),
    item.type === "predictOutput"
      ? checkPredictOutput(item.payload, item.language, deps.run)
      : Promise.resolve(checkTapTheLine(item.payload)),
  ]);
  results.push(linkResult, ...typeResults);
  return results;
}

export const isPassing = (results: CheckResult[]) => results.every((r) => r.status !== "fail");

/** Check ids that ran and passed, for `verification.checks`. */
export function passedCheckIds(results: CheckResult[]): string[] {
  const failed = new Set(results.filter((r) => r.status === "fail").map((r) => r.id));
  return [...new Set(results.filter((r) => r.status === "pass" && !failed.has(r.id)).map((r) => r.id))];
}

export async function findJsonFiles(target: string): Promise<string[]> {
  const info = await stat(target);
  if (info.isFile()) return target.endsWith(".json") ? [target] : [];
  const out: string[] = [];
  for (const entry of await readdir(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) out.push(...(await findJsonFiles(full)));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out.sort();
}

interface LoadedFile {
  file: string;
  isArray: boolean;
  items: unknown[];
}

async function loadFile(file: string): Promise<LoadedFile | { file: string; error: string }> {
  try {
    const data: unknown = JSON.parse(await readFile(file, "utf8"));
    return Array.isArray(data) ? { file, isArray: true, items: data } : { file, isArray: false, items: [data] };
  } catch (e) {
    return { file, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Runs `fn` over `items` with at most `limit` in flight. Keeps order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return out;
}

const field = (raw: unknown, key: string): string => {
  const v = raw && typeof raw === "object" ? (raw as Record<string, unknown>)[key] : undefined;
  return typeof v === "string" ? v : "?";
};

export interface VerifyRunOptions extends VerifyDeps {
  /** Write `verification` metadata back into the files. */
  write?: boolean;
  pipelineVersion: string;
  concurrency?: number;
  now?: () => Date;
}

export async function verifyPath(target: string, options: VerifyRunOptions): Promise<ItemReport[]> {
  const files = await findJsonFiles(target);
  const loaded = await Promise.all(files.map(loadFile));

  type Job = { file: LoadedFile; index: number; raw: unknown };
  const jobs: Job[] = [];
  const reports: ItemReport[] = [];
  for (const f of loaded) {
    if ("error" in f) {
      reports.push({ file: f.file, id: "?", type: "?", passed: false, results: [fail("json", f.error)] });
      continue;
    }
    f.items.forEach((raw, index) => jobs.push({ file: f, index, raw }));
  }

  // Ids must be unique across everything verified in this run.
  const idCounts = new Map<string, number>();
  for (const j of jobs) idCounts.set(field(j.raw, "id"), (idCounts.get(field(j.raw, "id")) ?? 0) + 1);

  const itemReports = await mapLimit(jobs, options.concurrency ?? 4, async (job): Promise<ItemReport> => {
    const results = await verifyItem(job.raw, options);
    const id = field(job.raw, "id");
    if (id !== "?" && (idCounts.get(id) ?? 0) > 1) results.push(fail("unique-id", `id "${id}" is used by more than one item`));
    return {
      file: job.file.file,
      index: job.file.isArray ? job.index : undefined,
      id,
      type: field(job.raw, "type"),
      passed: isPassing(results),
      results,
    };
  });
  reports.push(...itemReports);
  await options.links.save();

  if (options.write) {
    const verifiedAt = (options.now?.() ?? new Date()).toISOString().replace(/\.\d{3}Z$/, "Z");
    for (const f of loaded) {
      if ("error" in f) continue;
      let changed = false;
      f.items.forEach((raw, index) => {
        const report = itemReports.find((r) => r.file === f.file && (r.index ?? 0) === index);
        if (!report || !raw || typeof raw !== "object" || Array.isArray(raw)) return;
        (raw as Record<string, unknown>).verification = {
          passed: report.passed,
          checks: passedCheckIds(report.results),
          verifiedAt,
          pipelineVersion: options.pipelineVersion,
        };
        changed = true;
      });
      if (changed) await writeFile(f.file, JSON.stringify(f.isArray ? f.items : f.items[0], null, 2) + "\n");
    }
  }
  return reports;
}
