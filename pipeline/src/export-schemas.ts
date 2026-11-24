// Writes JSON Schema versions of the shared zod schemas to <repo>/schemas.
// Run with `pnpm schemas`. A test fails if the committed files are stale.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  ExerciseEnvelopeSchema,
  ExerciseSchema,
  PredictOutputPayloadSchema,
  TapTheLinePayloadSchema,
} from "./schemas.ts";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SCHEMAS_DIR = path.join(REPO_ROOT, "schemas");

export function renderSchemas(): Record<string, string> {
  const entries: Record<string, z.ZodType> = {
    "exercise-envelope.schema.json": ExerciseEnvelopeSchema,
    "exercise.schema.json": ExerciseSchema,
    "predict-output.schema.json": PredictOutputPayloadSchema,
    "tap-the-line.schema.json": TapTheLinePayloadSchema,
  };
  const out: Record<string, string> = {};
  for (const [file, schema] of Object.entries(entries)) {
    const json = z.toJSONSchema(schema, { io: "input" });
    out[file] = JSON.stringify(json, null, 2) + "\n";
  }
  return out;
}

async function main() {
  await mkdir(SCHEMAS_DIR, { recursive: true });
  for (const [file, text] of Object.entries(renderSchemas())) {
    await writeFile(path.join(SCHEMAS_DIR, file), text);
    console.log(`wrote schemas/${file}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
