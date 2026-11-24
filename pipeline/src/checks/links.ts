// Checks that `basedOn` source URLs respond with HTTP 200 (after redirects).
// Successful results are cached on disk so repeat runs don't hit the network.
// Failures are never cached: they are re-checked every run.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fail, pass, type CheckResult } from "./types.ts";

export const LINK_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

type CacheFile = Record<string, { status: number; checkedAt: string }>;

export interface LinkCheckerOptions {
  /** Path of the JSON cache file. Omit for an in-memory-only checker. */
  cachePath?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

export class LinkChecker {
  private cache: CacheFile = {};
  private loaded = false;
  private dirty = false;
  private inFlight = new Map<string, Promise<number | string>>();
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;

  constructor(private readonly options: LinkCheckerOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.now = options.now ?? Date.now;
  }

  private async load() {
    if (this.loaded) return;
    this.loaded = true;
    if (!this.options.cachePath) return;
    try {
      const data: unknown = JSON.parse(await readFile(this.options.cachePath, "utf8"));
      // Anything but a plain object (null, an array) is a damaged cache: start fresh.
      this.cache = data && typeof data === "object" && !Array.isArray(data) ? (data as CacheFile) : {};
    } catch {
      this.cache = {};
    }
  }

  async save() {
    if (!this.options.cachePath || !this.dirty) return;
    await mkdir(path.dirname(this.options.cachePath), { recursive: true });
    await writeFile(this.options.cachePath, JSON.stringify(this.cache, null, 2) + "\n");
    this.dirty = false;
  }

  /** Returns the HTTP status, or an error message if the request itself failed. */
  async status(url: string): Promise<number | string> {
    await this.load();
    const cached = this.cache[url];
    if (cached && this.now() - Date.parse(cached.checkedAt) < LINK_CACHE_TTL_MS) return cached.status;

    let pending = this.inFlight.get(url);
    if (!pending) {
      pending = this.request(url);
      this.inFlight.set(url, pending);
    }
    const result = await pending;
    if (result === 200) {
      this.cache[url] = { status: 200, checkedAt: new Date(this.now()).toISOString() };
      this.dirty = true;
    }
    return result;
  }

  private async request(url: string): Promise<number | string> {
    try {
      const res = await this.fetchImpl(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { "user-agent": "content-pipeline-link-check/1.0" },
      });
      await res.body?.cancel().catch(() => {});
      return res.status;
    } catch (e) {
      if (!(e instanceof Error)) return String(e);
      // Node's fetch wraps the useful part (ENOTFOUND, ECONNREFUSED...) in `cause`.
      const code = (e.cause as { code?: string } | undefined)?.code;
      return code ? `${e.message} (${code})` : e.message;
    }
  }

  async check(urls: string[]): Promise<CheckResult> {
    const id = "links";
    if (urls.length === 0) return pass(id);
    const results = await Promise.all(urls.map(async (url) => ({ url, status: await this.status(url) })));
    const bad = results.filter((r) => r.status !== 200);
    if (bad.length === 0) return pass(id);
    return fail(
      id,
      bad
        .map((r) => (typeof r.status === "number" ? `${r.url} returned HTTP ${r.status}` : `${r.url} failed: ${r.status}`))
        .join("; "),
    );
  }
}
