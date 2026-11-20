/**
 * Helpers for the WorkOS AuthKit callback (`app/callback/route.ts`).
 */

/**
 * Raised when the sign-in itself succeeded at WorkOS, but creating (or
 * finding) the matching local finance account failed.
 */
export class ProvisioningError extends Error {
  readonly reason: string;

  constructor(reason: string, options?: { cause?: unknown }) {
    super(`Could not provision the finance account (${reason}).`, options);
    this.name = "ProvisioningError";
    this.reason = reason;
  }
}

/**
 * AuthKit CallbackError codes that mean "this callback URL can no longer be
 * used" rather than "something is broken":
 *
 * - missing_pkce_cookie: the one-time sign-in cookie was already consumed
 *   (page refresh, Back button, or reopening the URL from history).
 * - oauth_state_mismatch: the URL belongs to a different or older attempt.
 *
 * In both cases no session is created by this request, so sending the user
 * to "/" is safe: signed-in users reach the dashboard, everyone else is sent
 * to a fresh sign-in.
 */
const STALE_CALLBACK_CODES = new Set([
  "missing_pkce_cookie",
  "oauth_state_mismatch",
]);

export function isStaleCallbackError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const { name, code } = error as { name?: unknown; code?: unknown };

  return (
    name === "CallbackError" &&
    typeof code === "string" &&
    STALE_CALLBACK_CODES.has(code)
  );
}

/**
 * A short, log-safe description of an error. Never includes request URLs,
 * query strings, tokens or cookies.
 */
export function describeError(error: unknown): string {
  if (error instanceof ProvisioningError) {
    return `ProvisioningError: ${error.reason}`;
  }

  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string"
      ? `${error.name} [${code}]: ${error.message}`
      : `${error.name}: ${error.message}`;
  }

  return "Unknown error";
}