import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderSchemas, SCHEMAS_DIR } from "../src/export-schemas.ts";
import { ExerciseSchema } from "../src/schemas.ts";

describe("exported JSON Schemas", () => {
  it.each(Object.entries(renderSchemas()))("schemas/%s is up to date (run `pnpm schemas`)", async (file, expected) => {
    expect(await readFile(path.join(SCHEMAS_DIR, file), "utf8")).toBe(expected);
  });
});

describe("ExerciseSchema", () => {
  it("parses the predictOutput example from docs/12-data-models.md", () => {
    const r = ExerciseSchema.safeParse({
      id: "po_1",
      type: "predictOutput",
      unitId: "t1-u2",
      concepts: ["types"],
      difficulty: 1,
      language: "javascript",
      basedOn: [{ label: "MDN: const", url: "https://developer.mozilla.org/" }],
      explanation: "x",
      verification: { passed: true, checks: ["runs"], verifiedAt: "2026-12-01T10:00:00Z", pipelineVersion: "1.0.0" },
      payload: { code: ['let a = "2";', "let b = 2;", "console.log(a + b);"], options: ["4", "22", '"2"2', "Error"], answerIndex: 1 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-http basedOn URLs", () => {
    const r = ExerciseSchema.safeParse({
      id: "x",
      type: "tapTheLine",
      unitId: "u",
      concepts: ["c"],
      difficulty: 1,
      language: "javascript",
      basedOn: [{ label: "bad", url: "javascript:alert(1)" }],
      explanation: "x",
      payload: { prompt: "p", code: ["a"], answerLines: [0] },
    });
    expect(r.success).toBe(false);
  });

  it("rejects repeated tapTheLine answer lines", () => {
    const r = ExerciseSchema.safeParse({
      id: "x",
      type: "tapTheLine",
      unitId: "u",
      concepts: ["c"],
      difficulty: 1,
      language: "javascript",
      basedOn: [],
      explanation: "x",
      payload: { prompt: "p", code: ["a", "b"], answerLines: [1, 1] },
    });
    expect(r.success).toBe(false);
  });
});
