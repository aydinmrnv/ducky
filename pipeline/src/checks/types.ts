export type CheckStatus = "pass" | "fail" | "warn";

export interface CheckResult {
  /** Stable id, recorded in `verification.checks` when it passes. */
  id: string;
  status: CheckStatus;
  message?: string;
}

export const pass = (id: string, message?: string): CheckResult => ({ id, status: "pass", message });
export const fail = (id: string, message: string): CheckResult => ({ id, status: "fail", message });
export const warn = (id: string, message: string): CheckResult => ({ id, status: "warn", message });
