import { describe, expect, it } from "vitest";
import { checkExplanation, checkLineLengths, countSentences, displayLength } from "../src/checks/text.ts";

describe("countSentences", () => {
  it.each([
    ["", 0],
    ["No terminator at all", 1],
    ["One sentence.", 1],
    ["One. Two.", 2],
    ["One. Two. Three.", 3],
    ["Really?! Yes.", 2],
    ["It reads items.length and 3.5 safely.", 1],
    ["Ends without a dot. Second part", 2],
    ["  Padded.  ", 1],
    ["Use let for values that change, e.g. a score. Use const otherwise.", 2],
    ["Strings, numbers, etc. are values.", 1],
  ])("%j has %i sentence(s)", (text, n) => {
    expect(countSentences(text)).toBe(n);
  });
});

describe("checkExplanation", () => {
  it("passes up to 2 sentences", () => {
    expect(checkExplanation("explanation", "One. Two.").status).toBe("pass");
  });
  it("fails at 3 sentences and names the field", () => {
    const r = checkExplanation("altExplanation", "One. Two. Three.");
    expect(r.status).toBe("fail");
    expect(r.id).toBe("altExplanation-length");
    expect(r.message).toContain("3 sentences");
  });
});

describe("checkLineLengths", () => {
  const line = (n: number) => ({ label: "code line 1", text: "x".repeat(n) });

  it("passes at 38 chars with no warning", () => {
    expect(checkLineLengths("line-length", [line(38)])).toEqual([{ id: "line-length", status: "pass" }]);
  });
  it("warns above 38 chars", () => {
    const results = checkLineLengths("line-length", [line(39)]);
    expect(results.map((r) => r.status)).toEqual(["pass", "warn"]);
  });
  it("still only warns at exactly 48 chars", () => {
    expect(checkLineLengths("line-length", [line(48)]).map((r) => r.status)).toEqual(["pass", "warn"]);
  });
  it("fails above 48 chars and says which line", () => {
    const [r] = checkLineLengths("line-length", [line(10), { label: "code line 2", text: "y".repeat(49) }]);
    expect(r!.status).toBe("fail");
    expect(r!.message).toBe("code line 2 is 49 chars (max 48)");
  });
  it("counts emoji as one character", () => {
    expect(displayLength("👍🏽ok")).toBe(3);
  });
});
