# Content pipeline

TypeScript CLI that verifies exercise content by actually running it. See [docs/07-content-pipeline.md](../docs/07-content-pipeline.md) for the full design. This is the M1 skeleton: verification only, no AI generation yet.

## Setup (Mac)

1. **Node 22+** and **pnpm** (`brew install node pnpm`, or `corepack enable`).
2. **Docker Desktop** for Mac: install from docker.com, open it once, and leave it running. The pipeline runs learner-facing code in a `node:22-alpine` container and pulls the image on first use.
3. Install dependencies:

   ```bash
   cd pipeline && pnpm install
   ```

No API keys or secrets are needed.

## Commands

Run these from the repo root or from `pipeline/`:

```bash
pnpm run pipeline verify --path content/exercises
```

```bash
pnpm run pipeline verify --path content/exercises --write
```

- `--path` takes a JSON file or a directory (searched recursively). Each file holds one exercise item, or an array of items.
- `--write` writes a `verification` block (`passed`, `checks`, `verifiedAt`, `pipelineVersion`) back into every item. Without it, files are never changed.
- The exit code is non-zero if any item fails.

> Use `pnpm run pipeline`, not `pnpm pipeline`: pnpm 12 has a built-in `pipeline` command that takes precedence over the script.

From `pipeline/`:

```bash
pnpm test
```

```bash
pnpm typecheck
```

```bash
pnpm schemas
```

`pnpm schemas` regenerates the JSON Schema files in [`/schemas`](../schemas) from the zod schemas in `src/schemas.ts`. A test fails if they are out of date. Cross-field rules (for example `answerIndex` must point at an option) live only in zod, since JSON Schema can't express them.

Tests that need Docker are skipped automatically when the Docker daemon isn't running. Everything else runs without Docker or network.

## What `verify` checks

**Every item**

| Check id | Rule |
|---|---|
| `schema` | Matches the envelope and payload schema for its type ([docs/12-data-models.md](../docs/12-data-models.md)). Unknown fields are rejected. Types without a verifier yet fail, so nothing unverified can be published. |
| `explanation-length`, `altExplanation-length` | At most 2 sentences. |
| `links` | Every `basedOn` URL returns HTTP 200 (after redirects). |
| `unique-id` | No two items in the run share an `id`. |

**Predict the Output**

| Check id | Rule |
|---|---|
| `runs` | Code runs in the sandbox and finishes. |
| `output-matches-answer` | Real stdout equals the stored correct option exactly. |
| `distractors-differ` | No other option equals the real output. |
| `options-unique` | No two options are the same. |
| `line-length` | Code lines and option lines: warn above 38 characters, fail above 48. |
| `code-lines` | Warn above 12 lines of code. |

How the real output is read: stdout with the one trailing newline from the last `console.log` removed, compared character for character. If the code throws before printing anything, the output is the option `Error`. Code that prints and then throws has no single right answer, so it fails.

**Tap the Line**: `line-length` on code lines. Answer line bounds and duplicates are schema rules.

## Sandbox

`src/sandbox.ts` runs each snippet with `docker run`:

- `--network none`: no network at all.
- `--cpus 0.5`, `--memory 128m` (no swap), `--pids-limit 64`.
- `--read-only` root filesystem; only a 16 MB `/tmp` tmpfs is writable.
- `--cap-drop ALL`, `no-new-privileges`, runs as the unprivileged `node` user.
- 5 second limit, enforced inside the container (`timeout -s KILL`, with `--init` so the kill can land) plus a host-side backstop that kills the container.
- Code goes in over stdin; nothing from the host is mounted. stdout and stderr are capped at 64 KB each.

## Link cache

Successful link checks are cached in `pipeline/.cache/links.json` (git-ignored) for 7 days. Failures are never cached, so a broken link is re-checked on every run. Delete the file to force a full re-check.

## Layout

```
src/
  cli.ts             CLI entry
  schemas.ts         zod schemas (shared shapes)
  export-schemas.ts  writes /schemas/*.schema.json
  sandbox.ts         Docker runner
  verify.ts          per-item orchestration, file loading, --write
  checks/            individual checks
test/                vitest suites
test/fixtures/       items that must fail (wrong answer, network, infinite loop...)
```
