// Runs untrusted JavaScript in a locked-down Docker container.
//
// Isolation: no network, CPU / memory / pid limits, read-only root filesystem
// (only a small tmpfs at /tmp is writable), all capabilities dropped, non-root
// user, no privilege escalation. The code is piped in over stdin, so nothing
// from the host is mounted.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

export const SANDBOX_IMAGE = "node:22-alpine";
export const DEFAULT_TIMEOUT_MS = 5_000;
/** Extra time on the host side for container start and teardown before we hard-kill. */
const HOST_GRACE_MS = 10_000;
/** Cap on captured stdout/stderr so runaway output can't exhaust host memory. */
const MAX_OUTPUT_BYTES = 64 * 1024;

export interface RunResult {
  stdout: string;
  stderr: string;
  /** Exit code of the code under test. null if it was killed. */
  exitCode: number | null;
  /** Killed with SIGKILL: by the time limit, the memory limit, or the host backstop. */
  killed: boolean;
  /** Killed after running for at least the time limit. */
  timedOut: boolean;
  /** True if stdout or stderr went past MAX_OUTPUT_BYTES and was cut. */
  truncated: boolean;
  durationMs: number;
}

export interface RunOptions {
  timeoutMs?: number;
  image?: string;
}

export class SandboxUnavailableError extends Error {}

function dockerArgs(name: string, timeoutMs: number, image: string): string[] {
  const seconds = Math.max(1, Math.ceil(timeoutMs / 1000));
  return [
    "run",
    "--rm",
    "-i",
    "--name", name,
    // tini as PID 1: the kernel ignores SIGKILL sent to a namespace's init from inside,
    // so without it the in-container timeout below could never kill the program.
    "--init",
    "--network", "none",
    "--cpus", "0.5",
    "--memory", "128m",
    "--memory-swap", "128m",
    "--pids-limit", "64",
    "--read-only",
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=16m",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--user", "node",
    "--workdir", "/tmp",
    "--env", "NODE_OPTIONS=--max-old-space-size=96",
    image,
    // busybox timeout: SIGKILL the program after N seconds (exit code 137).
    "timeout", "-s", "KILL", String(seconds),
    "node", "-",
  ];
}

function runDocker(args: string[], input?: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
    child.stdin.end(input ?? "");
  });
}

let readyCheck: Promise<void> | undefined;

/** Ensures the Docker daemon is reachable and the sandbox image is present (pulls it once if not). */
export function ensureSandboxReady(image = SANDBOX_IMAGE): Promise<void> {
  readyCheck ??= (async () => {
    let info;
    try {
      info = await runDocker(["info", "--format", "{{.ServerVersion}}"]);
    } catch {
      throw new SandboxUnavailableError("Docker CLI not found. Install Docker Desktop (see pipeline/README.md).");
    }
    if (info.code !== 0) {
      throw new SandboxUnavailableError("Docker daemon is not running. Start Docker Desktop and try again.");
    }
    const inspect = await runDocker(["image", "inspect", image]);
    if (inspect.code !== 0) {
      const pull = await runDocker(["pull", image]);
      if (pull.code !== 0) {
        throw new SandboxUnavailableError(`Could not pull ${image}: ${pull.stderr.trim()}`);
      }
    }
  })().catch((e: unknown) => {
    readyCheck = undefined; // let a later call retry once Docker is up
    throw e;
  });
  return readyCheck;
}

/** Runs `code` with Node inside the sandbox and captures stdout, stderr and the exit code. */
export async function runJavaScript(code: string, options: RunOptions = {}): Promise<RunResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const image = options.image ?? SANDBOX_IMAGE;
  await ensureSandboxReady(image);

  const name = `pipeline-sandbox-${randomUUID()}`;
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const child = spawn("docker", dockerArgs(name, timeoutMs, image), { stdio: ["pipe", "pipe", "pipe"] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    let outBytes = 0;
    let errBytes = 0;
    let truncated = false;
    let hostKilled = false;

    const collect = (chunks: Buffer[], size: number, d: Buffer): number => {
      const room = MAX_OUTPUT_BYTES - size;
      if (room <= 0) {
        truncated = true;
        return size;
      }
      if (d.length > room) truncated = true;
      const piece = d.subarray(0, room);
      chunks.push(piece);
      return size + piece.length;
    };
    child.stdout.on("data", (d: Buffer) => (outBytes = collect(out, outBytes, d)));
    child.stderr.on("data", (d: Buffer) => (errBytes = collect(err, errBytes, d)));

    // Backstop in case the in-container timeout never fires (e.g. container hung while starting).
    const hardKill = setTimeout(() => {
      hostKilled = true;
      spawn("docker", ["kill", name], { stdio: "ignore" }).on("error", () => {});
      child.kill("SIGKILL");
    }, timeoutMs + HOST_GRACE_MS);

    child.on("error", (e) => {
      clearTimeout(hardKill);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(hardKill);
      // 137 = killed by SIGKILL: either busybox timeout or the OOM killer. Both are "did not finish".
      const killed = hostKilled || code === 137;
      const durationMs = Date.now() - started;
      resolve({
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
        exitCode: killed ? null : code,
        killed,
        timedOut: killed && durationMs >= timeoutMs,
        truncated,
        durationMs,
      });
    });
    child.stdin.on("error", () => {}); // container may exit before reading all input
    child.stdin.end(code);
  });
}
