// Content pipeline CLI.
//   pnpm pipeline verify --path content/exercises [--write]
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { LinkChecker } from "./checks/links.ts";
import { ensureSandboxReady, runJavaScript, SandboxUnavailableError } from "./sandbox.ts";
import { verifyPath, type ItemReport } from "./verify.ts";

const PIPELINE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = path.resolve(PIPELINE_DIR, "..");
const PIPELINE_VERSION = (JSON.parse(readFileSync(path.join(PIPELINE_DIR, "package.json"), "utf8")) as { version: string })
  .version;

const USAGE = `Usage:
  pnpm pipeline verify --path <file-or-dir> [--write]

Options:
  --path    Exercise JSON file or directory (searched recursively).
            Relative paths resolve from where you ran the command, then from the repo root.
  --write   Write verification metadata back into each item.`;

/** Relative paths: try the caller's directory first (pnpm sets INIT_CWD), then the repo root. */
function resolveTarget(p: string): string {
  if (path.isAbsolute(p)) return p;
  const fromCaller = path.resolve(process.env.INIT_CWD ?? process.cwd(), p);
  return existsSync(fromCaller) ? fromCaller : path.resolve(REPO_ROOT, p);
}

function printReport(reports: ItemReport[]) {
  for (const r of reports) {
    const where = path.relative(REPO_ROOT, r.file) + (r.index !== undefined ? `[${r.index}]` : "");
    console.log(`${r.passed ? "PASS" : "FAIL"}  ${r.id}  (${r.type})  ${where}`);
    for (const c of r.results) {
      if (c.status === "fail") console.log(`      ✗ ${c.id}: ${c.message}`);
      else if (c.status === "warn") console.log(`      ! ${c.id}: ${c.message}`);
    }
  }
  const failed = reports.filter((r) => !r.passed).length;
  console.log(`\n${reports.length} item(s): ${reports.length - failed} passed, ${failed} failed`);
}

async function verify(args: string[]): Promise<number> {
  const { values } = parseArgs({
    args,
    options: { path: { type: "string" }, write: { type: "boolean", default: false } },
    strict: true,
  });
  if (!values.path) {
    console.error(USAGE);
    return 2;
  }
  const target = resolveTarget(values.path);
  if (!existsSync(target)) {
    console.error(`Not found: ${values.path}`);
    return 2;
  }

  // Fail once, clearly, if Docker is down, instead of a sandbox error on every item.
  await ensureSandboxReady();

  const links = new LinkChecker({ cachePath: path.join(PIPELINE_DIR, ".cache", "links.json") });
  const reports = await verifyPath(target, {
    run: (code) => runJavaScript(code),
    links,
    write: values.write,
    pipelineVersion: PIPELINE_VERSION,
  });
  if (reports.length === 0) {
    console.error(`No exercise JSON files found in ${values.path}`);
    return 1;
  }
  printReport(reports);
  if (values.write) console.log("Wrote verification metadata.");
  return reports.every((r) => r.passed) ? 0 : 1;
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  switch (command) {
    case "verify":
      return verify(rest);
    case undefined:
    case "help":
    case "--help":
      console.log(USAGE);
      return command === undefined ? 2 : 0;
    default:
      console.error(`Unknown command: ${command}\n\n${USAGE}`);
      return 2;
  }
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (e) {
  if (e instanceof SandboxUnavailableError) {
    console.error(e.message);
  } else {
    console.error(e);
  }
  process.exitCode = 1;
}
