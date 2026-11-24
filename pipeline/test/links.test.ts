import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LINK_CACHE_TTL_MS, LinkChecker } from "../src/checks/links.ts";

function fakeFetch(statusFor: (url: string) => number | Error) {
  const calls: string[] = [];
  const impl = (async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    const s = statusFor(url);
    if (s instanceof Error) throw s;
    return new Response(null, { status: s });
  }) as typeof fetch;
  return { impl, calls };
}

describe("LinkChecker", () => {
  it("passes when every URL returns 200", async () => {
    const { impl } = fakeFetch(() => 200);
    const r = await new LinkChecker({ fetchImpl: impl }).check(["https://a.test", "https://b.test"]);
    expect(r.status).toBe("pass");
  });

  it("passes with no URLs", async () => {
    expect((await new LinkChecker().check([])).status).toBe("pass");
  });

  it("fails on non-200 and network errors, naming each URL", async () => {
    const { impl } = fakeFetch((u) => (u.includes("gone") ? 404 : u.includes("down") ? new Error("ECONNREFUSED") : 200));
    const r = await new LinkChecker({ fetchImpl: impl }).check(["https://ok.test", "https://gone.test", "https://down.test"]);
    expect(r.status).toBe("fail");
    expect(r.message).toBe("https://gone.test returned HTTP 404; https://down.test failed: ECONNREFUSED");
  });

  it("treats other 2xx codes as failures (must be exactly 200)", async () => {
    const { impl } = fakeFetch(() => 204);
    expect((await new LinkChecker({ fetchImpl: impl }).check(["https://a.test"])).status).toBe("fail");
  });

  it("only requests each URL once per run", async () => {
    const { impl, calls } = fakeFetch(() => 200);
    const checker = new LinkChecker({ fetchImpl: impl });
    await Promise.all([checker.check(["https://a.test"]), checker.check(["https://a.test"])]);
    await checker.check(["https://a.test"]);
    expect(calls).toEqual(["https://a.test"]);
  });

  it("persists successes to disk and reuses them until they expire", async () => {
    const cachePath = path.join(await mkdtemp(path.join(tmpdir(), "links-")), "links.json");
    let now = Date.parse("2026-11-01T00:00:00Z");
    const first = fakeFetch(() => 200);
    const a = new LinkChecker({ cachePath, fetchImpl: first.impl, now: () => now });
    await a.check(["https://a.test"]);
    await a.save();
    expect(JSON.parse(await readFile(cachePath, "utf8"))).toHaveProperty(["https://a.test", "status"], 200);

    const second = fakeFetch(() => 200);
    await new LinkChecker({ cachePath, fetchImpl: second.impl, now: () => now }).check(["https://a.test"]);
    expect(second.calls).toEqual([]);

    now += LINK_CACHE_TTL_MS + 1;
    const third = fakeFetch(() => 200);
    await new LinkChecker({ cachePath, fetchImpl: third.impl, now: () => now }).check(["https://a.test"]);
    expect(third.calls).toEqual(["https://a.test"]);
  });

  it.each(["null", "[]", "not json"])("starts fresh when the cache file holds %s", async (contents) => {
    const dir = await mkdtemp(path.join(tmpdir(), "links-"));
    const cachePath = path.join(dir, "links.json");
    await writeFile(cachePath, contents);
    const { impl } = fakeFetch(() => 200);
    expect((await new LinkChecker({ cachePath, fetchImpl: impl }).check(["https://a.test"])).status).toBe("pass");
  });

  it("never caches failures", async () => {
    const cachePath = path.join(await mkdtemp(path.join(tmpdir(), "links-")), "links.json");
    const failing = fakeFetch(() => 500);
    const a = new LinkChecker({ cachePath, fetchImpl: failing.impl });
    await a.check(["https://a.test"]);
    await a.save();

    const again = fakeFetch(() => 200);
    const r = await new LinkChecker({ cachePath, fetchImpl: again.impl }).check(["https://a.test"]);
    expect(again.calls).toEqual(["https://a.test"]);
    expect(r.status).toBe("pass");
  });
});
