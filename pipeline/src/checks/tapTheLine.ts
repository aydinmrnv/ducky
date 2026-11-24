// Tap the Line checks. Index bounds and uniqueness are enforced by the schema;
// here we check what the schema can't: phone-width lines.
import type { TapTheLinePayload } from "../schemas.ts";
import { checkLineLengths } from "./text.ts";
import type { CheckResult } from "./types.ts";

export function checkTapTheLine(payload: TapTheLinePayload): CheckResult[] {
  return checkLineLengths(
    "line-length",
    payload.code.map((text, i) => ({ label: `code line ${i + 1}`, text })),
  );
}
