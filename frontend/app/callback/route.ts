import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

import {
  ProvisioningError,
  describeError,
  isStaleCallbackError,
} from "@/lib/auth-callback-errors";

export const GET = handleAuth({
  returnPathname: "/",

  onSuccess: async ({ user }) => {
    const apiUrl = process.env.FINANCE_API_URL;
    const secret = process.env.PROVISIONING_SECRET;

    if (!apiUrl || !secret) {
      throw new ProvisioningError("finance API configuration is missing");
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

    let response: Response;

    try {
      response = await fetch(`${apiUrl}/internal/users/provision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Provisioning-Secret": secret,
        },
        body: JSON.stringify({
          workos_user_id: user.id,
          email: user.email,
          name: name || user.email,
        }),
        cache: "no-store",
      });
    } catch (error) {
      // Network failure, DNS problem, or the API is unreachable.
      throw new ProvisioningError("finance API unreachable", { cause: error });
    }

    if (!response.ok) {
      const body = await response.text();
      console.error(
        `[Oqita auth] Account provisioning failed (HTTP ${response.status}):`,
        body
      );

      throw new ProvisioningError(`finance API returned ${response.status}`);
    }
  },

  onError: ({ error, request }) => {
    // A used or outdated callback URL (refresh, Back button, history).
    // Nothing is broken: "/" sends signed-in users to the dashboard and
    // everyone else to a fresh sign-in.
    if (isStaleCallbackError(error)) {
      console.warn("[Oqita auth] Stale callback URL; redirecting to home.");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Real failures (including account provisioning). Show a friendly page
    // instead of raw JSON. This deliberately does NOT redirect to "/", which
    // could loop: "/" -> sign-in -> callback -> error -> "/" ...
    console.error("[Oqita auth] Callback failed:", describeError(error));
    return NextResponse.redirect(new URL("/auth-error", request.url));
  },
});