import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LinkChecker } from "../src/checks/links.ts";
import type { RunResult } from "../src/sandbox.ts";

export const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Docker tests are skipped (not failed) on machines without a running Docker daemon. */
export const dockerAvailable = spawnSync("docker", ["info"], { stdio: "ignore" }).status === 0;

export function runResult(partial: Partial<RunResult>): RunResult {
  return {
    stdout: "",
    stderr: "",
    exitCode: 0,
    killed: false,
    timedOut: false,
    truncated: false,
    durationMs: 10,
    ...partial,
  };
}

/** A link checker that never touches the network: every URL returns `status`. */
export function offlineLinks(status = 200): LinkChecker {
  return new LinkChecker({ fetchImpl: async () => new Response(null, { status }) });
}

/** Rewrites the trailing newline console.log adds, so fake runs look like real ones. */
export const printed = (s: string) => runResult({ stdout: s + "\n" });
