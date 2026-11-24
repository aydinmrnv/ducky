// Shared content schemas. Source of truth for shapes is docs/12-data-models.md;
// keep these in sync with it. JSON Schema copies are exported to /schemas by
// `pnpm schemas` so the iOS app and backend can share them.
import { z } from "zod";

export const BasedOnSchema = z
  .object({
    label: z.string().min(1),
    url: z.url({ protocol: /^https?$/ }),
  })
  .strict();

export const VerificationSchema = z
  .object({
    passed: z.boolean(),
    checks: z.array(z.string()),
    verifiedAt: z.iso.datetime(),
    pipelineVersion: z.string().min(1),
  })
  .strict();

/** Exercise types from docs/12-data-models.md. Only some have payload schemas (and verifiers) so far. */
export const ExerciseTypeSchema = z.enum([
  "predictOutput",
  "tapTheLine",
  "fillBlank",
  "orderSteps",
  "multipleChoice",
  "pickBetterPrompt",
  "spotTheBug",
  "codeReview",
  "handFix",
  "teachItBack",
]);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

export const LanguageSchema = z.enum(["javascript", "html", "css"]);

const codeLines = z.array(z.string()).min(1);

export const PredictOutputPayloadSchema = z
  .object({
    code: codeLines,
    options: z.array(z.string().min(1)).min(3).max(4),
    answerIndex: z.int().nonnegative(),
  })
  .strict()
  .refine((p) => p.answerIndex < p.options.length, {
    message: "answerIndex must point at one of the options",
    path: ["answerIndex"],
  });
export type PredictOutputPayload = z.infer<typeof PredictOutputPayloadSchema>;

export const TapTheLinePayloadSchema = z
  .object({
    prompt: z.string().min(1),
    code: codeLines,
    answerLines: z.array(z.int().nonnegative()).min(1),
  })
  .strict()
  .refine((p) => p.answerLines.every((i) => i < p.code.length), {
    message: "every answerLines index must point at a line of code",
    path: ["answerLines"],
  })
  .refine((p) => new Set(p.answerLines).size === p.answerLines.length, {
    message: "answerLines must not repeat",
    path: ["answerLines"],
  });
export type TapTheLinePayload = z.infer<typeof TapTheLinePayloadSchema>;

/** The common envelope every exercise item shares. `payload` is validated per type. */
export const ExerciseEnvelopeSchema = z
  .object({
    id: z.string().min(1),
    type: ExerciseTypeSchema,
    unitId: z.string().min(1),
    concepts: z.array(z.string().min(1)).min(1),
    difficulty: z.int().min(1),
    language: LanguageSchema,
    basedOn: z.array(BasedOnSchema),
    explanation: z.string().min(1),
    altExplanation: z.string().min(1).optional(),
    verification: VerificationSchema.optional(),
    reviewedBy: z.string().min(1).optional(),
    reviewedAt: z.iso.datetime().optional(),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();
export type ExerciseEnvelope = z.infer<typeof ExerciseEnvelopeSchema>;

/** Payload schemas for the types the pipeline can verify today. */
export const PAYLOAD_SCHEMAS = {
  predictOutput: PredictOutputPayloadSchema,
  tapTheLine: TapTheLinePayloadSchema,
} as const satisfies Partial<Record<ExerciseType, z.ZodType>>;

export type VerifiableType = keyof typeof PAYLOAD_SCHEMAS;

export function isVerifiableType(t: string): t is VerifiableType {
  return Object.hasOwn(PAYLOAD_SCHEMAS, t);
}

/** A full exercise item (envelope + typed payload) for the verifiable types. */
export const ExerciseSchema = z.discriminatedUnion("type", [
  ExerciseEnvelopeSchema.extend({
    type: z.literal("predictOutput"),
    payload: PredictOutputPayloadSchema,
  }),
  ExerciseEnvelopeSchema.extend({
    type: z.literal("tapTheLine"),
    payload: TapTheLinePayloadSchema,
  }),
]);
export type Exercise = z.infer<typeof ExerciseSchema>;
