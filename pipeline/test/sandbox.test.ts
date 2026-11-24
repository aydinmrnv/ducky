// Real Docker runs. Skipped when Docker isn't running.
import { describe, expect, it } from "vitest";
import { runJavaScript } from "../src/sandbox.ts";
import { dockerAvailable } from "./helpers.ts";

describe.skipIf(!dockerAvailable)("sandbox (Docker)", () => {
  it("captures stdout and exit code", async () => {
    const r = await runJavaScript('console.log("2" + 2); console.error("e");');
    expect(r).toMatchObject({ stdout: "22\n", stderr: "e\n", exitCode: 0, timedOut: false });
  });

  it("reports a non-zero exit for uncaught errors", async () => {
    const r = await runJavaScript('const a = 1; a = 2;');
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("TypeError");
  });

  it("has no network access", async () => {
    const r = await runJavaScript(
      'fetch("https://example.com").then(() => console.log("online"), (e) => console.log("offline:" + e.cause?.code));',
    );
    expect(r.stdout).not.toContain("online\n");
    // Either the request fails fast, or DNS hangs and the time limit kills it. Both are safe.
    if (!r.timedOut) expect(r.stdout).toMatch(/^offline:/);
  });

  it("cannot open raw sockets either", async () => {
    const r = await runJavaScript(
      'require("net").connect(80, "1.1.1.1").on("connect", () => console.log("connected")).on("error", (e) => console.log("blocked:" + e.code));',
    );
    expect(r.stdout).not.toContain("connected");
  });

  it("kills code that runs forever at the time limit", async () => {
    const r = await runJavaScript("while (true) {}");
    expect(r).toMatchObject({ exitCode: null, killed: true, timedOut: true });
    expect(r.durationMs).toBeGreaterThanOrEqual(5_000);
    expect(r.durationMs).toBeLessThan(10_000);
  });

  it("honours a custom timeout", async () => {
    const r = await runJavaScript("setInterval(() => {}, 1000);", { timeoutMs: 1_000 });
    expect(r.timedOut).toBe(true);
    expect(r.durationMs).toBeLessThan(5_000);
  });

  it("has a read-only filesystem outside /tmp", async () => {
    const r = await runJavaScript(
      'const fs = require("fs"); try { fs.writeFileSync("/home/node/x", "y"); console.log("wrote home"); } catch (e) { console.log(e.code); } fs.writeFileSync("/tmp/ok", "y"); console.log("tmp ok");',
    );
    expect(r.stdout).toBe("EROFS\ntmp ok\n");
  });

  it("caps runaway output", async () => {
    const r = await runJavaScript('const s = "x".repeat(1000); for (let i = 0; i < 1000; i++) console.log(s);');
    expect(r.truncated).toBe(true);
    expect(r.stdout.length).toBeLessThanOrEqual(64 * 1024);
  });

  it("enforces the memory limit", async () => {
    const r = await runJavaScript("const a = []; while (true) a.push(new Array(1e6).fill(1));");
    expect(r.exitCode).not.toBe(0);
    expect(r.stdout).toBe("");
  });
});
