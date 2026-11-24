import { describe, expect, it } from "vitest";
import { checkPredictOutput, observedOutput, outputChecks, staticChecks } from "../src/checks/predictOutput.ts";
import type { CheckResult } from "../src/checks/types.ts";
import type { PredictOutputPayload } from "../src/schemas.ts";
import { printed, runResult } from "./helpers.ts";

const payload = (over: Partial<PredictOutputPayload> = {}): PredictOutputPayload => ({
  code: ['let a = "2";', "let b = 2;", "console.log(a + b);"],
  options: ["4", "22", '"2"2', "Error"],
  answerIndex: 1,
  ...over,
});

const byId = (results: CheckResult[], id: string) => results.filter((r) => r.id === id);

describe("observedOutput", () => {
  it("strips exactly one trailing newline", () => {
    expect(observedOutput(runResult({ stdout: "a\n\n" }))).toMatchObject({ ok: true, output: "a\n" });
  });
  it("keeps multi-line output", () => {
    expect(observedOutput(runResult({ stdout: "5\n1\n" }))).toMatchObject({ ok: true, output: "5\n1" });
  });
  it('maps an uncaught error with no output to "Error"', () => {
    expect(observedOutput(runResult({ exitCode: 1, stderr: "TypeError" }))).toMatchObject({ ok: true, output: "Error" });
  });
  it.each([
    ["Docker failing to start the container", 125, "docker: Error response from daemon: Conflict."],
    ["a V8 out-of-memory abort", 134, "FATAL ERROR: Reached heap limit Allocation failed"],
    ["process.exit with a custom code", 3, ""],
    ["exit 1 with no uncaught error", 1, ""],
  ])('does not treat %s as "Error"', (_label, exitCode, stderr) => {
    expect(observedOutput(runResult({ exitCode, stderr })).ok).toBe(false);
  });
  it('maps a thrown non-Error value to "Error"', () => {
    expect(observedOutput(runResult({ exitCode: 1, stderr: '[stdin]:1\nthrow "boom"\n^\nboom\n(Use `node --trace-uncaught ...` to show where the exception was thrown)\n' }))).toMatchObject({
      ok: true,
      output: "Error",
    });
  });
  it("rejects output followed by a crash", () => {
    expect(observedOutput(runResult({ exitCode: 1, stdout: "1\n" })).ok).toBe(false);
  });
  it("rejects timeouts", () => {
    const r = observedOutput(runResult({ exitCode: null, killed: true, timedOut: true }));
    expect(r).toEqual({ ok: false, reason: "code did not finish within the time limit" });
  });
  it("rejects truncated output", () => {
    expect(observedOutput(runResult({ truncated: true })).ok).toBe(false);
  });
});

describe("outputChecks", () => {
  it("passes when the stored answer is the real output", () => {
    const results = outputChecks(payload(), printed("22"));
    expect(results.every((r) => r.status === "pass")).toBe(true);
  });

  it("fails with a clear message when the stored answer is wrong", () => {
    const [r] = byId(outputChecks(payload({ answerIndex: 0 }), printed("22")), "output-matches-answer");
    expect(r).toEqual({
      id: "output-matches-answer",
      status: "fail",
      message: 'stored answer (option 1) is "4" but the code prints "22"',
    });
  });

  it("fails when a distractor equals the real output", () => {
    const p = payload({ options: ["22", "4", "22 ", "22"], answerIndex: 0 });
    const [r] = byId(outputChecks(p, printed("22")), "distractors-differ");
    expect(r!.status).toBe("fail");
    expect(r!.message).toContain("option 4");
    expect(r!.message).not.toContain("option 3"); // "22 " differs by a space: exact match only
  });

  it("is whitespace-exact", () => {
    const [r] = byId(outputChecks(payload({ options: ["22 ", "4", "Error"], answerIndex: 0 }), printed("22")), "output-matches-answer");
    expect(r!.status).toBe("fail");
  });

  it("accepts Error as the answer for code that throws", () => {
    const p = payload({ code: ['const n = "a";', 'n = "b";'], options: ["a", "b", "Error"], answerIndex: 2 });
    const results = outputChecks(p, runResult({ exitCode: 1, stderr: "TypeError: Assignment to constant variable." }));
    expect(results.every((r) => r.status === "pass")).toBe(true);
  });

  it("fails the run check on timeout and skips answer checks", () => {
    const results = outputChecks(payload(), runResult({ exitCode: null, killed: true, timedOut: true }));
    expect(results).toEqual([{ id: "runs", status: "fail", message: "code did not finish within the time limit" }]);
  });

  it("warns when the code writes to stderr but still exits 0", () => {
    const results = outputChecks(payload(), runResult({ stdout: "22\n", stderr: "careful\n" }));
    expect(byId(results, "runs").map((r) => r.status)).toEqual(["pass", "warn"]);
  });
});

describe("staticChecks", () => {
  it("fails duplicate options", () => {
    const [r] = byId(staticChecks(payload({ options: ["1", "1", "2"] })), "options-unique");
    expect(r!.status).toBe("fail");
  });
  it("checks each line of multi-line options", () => {
    const [r] = byId(staticChecks(payload({ options: ["ok\n" + "x".repeat(49), "a", "b"] })), "line-length");
    expect(r!.message).toBe("option 1 line 2 is 49 chars (max 48)");
  });
  it("warns on long snippets", () => {
    const results = staticChecks(payload({ code: Array.from({ length: 13 }, () => "x;") }));
    expect(byId(results, "code-lines")[0]!.status).toBe("warn");
  });
});

describe("checkPredictOutput", () => {
  it("does not run non-JavaScript code", async () => {
    let ran = false;
    const results = await checkPredictOutput(payload(), "html", async () => {
      ran = true;
      return printed("22");
    });
    expect(ran).toBe(false);
    expect(byId(results, "runs")[0]!.status).toBe("fail");
  });

  it("joins code lines with newlines before running", async () => {
    let received = "";
    await checkPredictOutput(payload(), "javascript", async (code) => {
      received = code;
      return printed("22");
    });
    expect(received).toBe('let a = "2";\nlet b = 2;\nconsole.log(a + b);');
  });

  it("reports sandbox failures instead of throwing", async () => {
    const results = await checkPredictOutput(payload(), "javascript", async () => {
      throw new Error("Docker daemon is not running");
    });
    expect(byId(results, "runs")[0]).toMatchObject({ status: "fail", message: "sandbox error: Docker daemon is not running" });
  });
});
