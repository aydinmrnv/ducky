import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runJavaScript } from "../src/sandbox.ts";
import { passedCheckIds, verifyItem, verifyPath, type ItemReport } from "../src/verify.ts";
import { dockerAvailable, FIXTURES, offlineLinks, printed, REPO_ROOT } from "./helpers.ts";

const SAMPLE_CONTENT = path.join(REPO_ROOT, "content", "exercises");

const failures = (r: ItemReport) => r.results.filter((c) => c.status === "fail");
const fixture = (name: string) => path.join(FIXTURES, `${name}.json`);

const validItem = () => ({
  id: "po_test_1",
  type: "predictOutput",
  unitId: "t1-u2",
  concepts: ["types"],
  difficulty: 1,
  language: "javascript",
  basedOn: [{ label: "Doc", url: "https://example.test/doc" }],
  explanation: "It prints 2.",
  payload: { code: ["console.log(1 + 1);"], options: ["2", "11", "Error"], answerIndex: 0 },
});

const fakeDeps = { run: async () => printed("2"), links: offlineLinks() };

describe("verifyItem (no Docker)", () => {
  it("passes a valid item", async () => {
    const results = await verifyItem(validItem(), fakeDeps);
    expect(results.filter((r) => r.status === "fail")).toEqual([]);
  });

  it("fails schema validation with the path of the problem", async () => {
    const item = { ...validItem(), payload: { ...validItem().payload, answerIndex: 7 } };
    const [r] = await verifyItem(item, fakeDeps);
    expect(r).toMatchObject({ id: "schema", status: "fail" });
    expect(r!.message).toContain("payload.answerIndex");
  });

  it("rejects unknown fields so typos don't slip through", async () => {
    const [r] = await verifyItem({ ...validItem(), explaination: "typo" }, fakeDeps);
    expect(r!.status).toBe("fail");
  });

  it("fails types that have no verifier yet", async () => {
    const [r] = await verifyItem({ ...validItem(), type: "spotTheBug" }, fakeDeps);
    expect(r!.message).toContain('no verifier for exercise type "spotTheBug"');
  });

  it("checks tapTheLine answer lines are in range", async () => {
    const item = {
      ...validItem(),
      type: "tapTheLine",
      payload: { prompt: "Tap it.", code: ["a;", "b;"], answerLines: [2] },
    };
    const [r] = await verifyItem(item, fakeDeps);
    expect(r).toMatchObject({ id: "schema", status: "fail" });
  });

  it("fails broken basedOn links", async () => {
    const results = await verifyItem(validItem(), { ...fakeDeps, links: offlineLinks(404) });
    expect(results.find((r) => r.id === "links")).toMatchObject({ status: "fail" });
  });

  it("fails long explanations", async () => {
    const results = await verifyItem({ ...validItem(), altExplanation: "A. B. C." }, fakeDeps);
    expect(results.find((r) => r.id === "altExplanation-length")?.status).toBe("fail");
  });
});

describe("verifyPath (no Docker)", () => {
  it("reports invalid JSON files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "verify-"));
    await writeFile(path.join(dir, "bad.json"), "{ nope");
    const [r] = await verifyPath(dir, { ...fakeDeps, pipelineVersion: "test" });
    expect(r).toMatchObject({ passed: false });
    expect(r!.results[0]!.id).toBe("json");
  });

  it("flags duplicate ids across files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "verify-"));
    await writeFile(path.join(dir, "a.json"), JSON.stringify(validItem()));
    await writeFile(path.join(dir, "b.json"), JSON.stringify([validItem()]));
    const reports = await verifyPath(dir, { ...fakeDeps, pipelineVersion: "test" });
    expect(reports.every((r) => failures(r).some((f) => f.id === "unique-id"))).toBe(true);
  });

  it("writes verification metadata only with write: true", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "verify-"));
    const file = path.join(dir, "a.json");
    const original = JSON.stringify(validItem(), null, 2) + "\n";
    await writeFile(file, original);

    await verifyPath(dir, { ...fakeDeps, pipelineVersion: "test" });
    expect(await readFile(file, "utf8")).toBe(original);

    await verifyPath(dir, {
      ...fakeDeps,
      write: true,
      pipelineVersion: "9.9.9",
      now: () => new Date("2026-11-23T10:00:00.123Z"),
    });
    const written = JSON.parse(await readFile(file, "utf8"));
    expect(written.verification).toEqual({
      passed: true,
      checks: ["schema", "explanation-length", "links", "options-unique", "line-length", "runs", "output-matches-answer", "distractors-differ"],
      verifiedAt: "2026-11-23T10:00:00Z",
      pipelineVersion: "9.9.9",
    });
    // The written item must still be valid (verification is part of the envelope schema).
    const again = await verifyPath(dir, { ...fakeDeps, pipelineVersion: "test" });
    expect(again[0]!.passed).toBe(true);
  });

  it("records failed verification too", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "verify-"));
    await cp(fixture("long-explanation"), path.join(dir, "x.json"));
    await verifyPath(dir, { run: async () => printed("1"), links: offlineLinks(), write: true, pipelineVersion: "t" });
    const written = JSON.parse(await readFile(path.join(dir, "x.json"), "utf8"));
    expect(written.verification.passed).toBe(false);
    expect(written.verification.checks).not.toContain("explanation-length");
  });

  it("passedCheckIds drops ids that also failed", () => {
    expect(
      passedCheckIds([
        { id: "a", status: "pass" },
        { id: "b", status: "pass" },
        { id: "b", status: "fail", message: "x" },
        { id: "c", status: "warn", message: "w" },
      ]),
    ).toEqual(["a"]);
  });
});

describe.skipIf(!dockerAvailable)("verifyPath with the real sandbox", () => {
  const deps = { run: (code: string) => runJavaScript(code), links: offlineLinks(), pipelineVersion: "test" };
  const verifyFixture = async (name: string) => (await verifyPath(fixture(name), deps))[0]!;

  it("passes the sample content in content/exercises", async () => {
    const reports = await verifyPath(SAMPLE_CONTENT, deps);
    expect(reports.length).toBeGreaterThanOrEqual(6);
    for (const r of reports) expect(failures(r), `${r.id} should pass`).toEqual([]);
  });

  it("fails a deliberately wrong Predict the Output answer with a clear message", async () => {
    const r = await verifyFixture("wrong-answer");
    expect(r.passed).toBe(false);
    expect(failures(r)).toEqual([
      {
        id: "output-matches-answer",
        status: "fail",
        message: 'stored answer (option 1) is "4" but the code prints "22"',
      },
      // The real output "22" is also sitting in the options as a distractor.
      { id: "distractors-differ", status: "fail", message: 'distractor option 2 equals the real output "22"' },
    ]);
  });

  it("fails when a distractor equals the real output", async () => {
    const r = await verifyFixture("distractor-equals-output");
    expect(failures(r).map((f) => f.id)).toEqual(["options-unique", "distractors-differ"]);
  });

  it("fails safely when code tries to use the network", async () => {
    const r = await verifyFixture("network-access");
    // The stored answer claims "online". The request fails (or hangs until the time limit),
    // so either the answer check or the run check must fail. "online" must never be observed.
    expect(r.passed).toBe(false);
    const ids = failures(r).map((f) => f.id);
    expect(ids.includes("runs") || ids.includes("output-matches-answer")).toBe(true);
    expect(r.results.some((c) => c.message?.includes('prints "online"'))).toBe(false);
  });

  it("fails safely when code runs forever", async () => {
    const r = await verifyFixture("infinite-loop");
    expect(failures(r)).toEqual([{ id: "runs", status: "fail", message: "code did not finish within the time limit" }]);
  });

  it("fails lines over 48 characters", async () => {
    const r = await verifyFixture("long-line");
    expect(failures(r)).toEqual([
      { id: "line-length", status: "fail", message: "code line 1 is 63 chars (max 48)" },
    ]);
  });

  it("fails explanations over 2 sentences", async () => {
    const r = await verifyFixture("long-explanation");
    expect(failures(r).map((f) => f.id)).toEqual(["explanation-length"]);
  });
});
