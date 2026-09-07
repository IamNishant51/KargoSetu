import Cookies from "js-cookie";

/**
 * Single auth-boundary helper for the whole app.
 *
 * Writes the session cookie, then performs a FULL document navigation
 * (not router.push) so that:
 *  1. middleware.ts is guaranteed to see `auth_token` on the request
 *     (client-side RSC "flight" fetches can race a just-written
 *     document.cookie, causing a bounce back to /login), and
 *  2. all stale RSC payloads + React Query caches are discarded —
 *     the dashboard boots with a fresh session, no refresh needed.
 */
export function persistSessionAndRedirect(accessToken: string, to = "/dashboard") {
  Cookies.set("auth_token", accessToken, {
    expires: 7,
    path: "/",
    sameSite: "lax",
    // Localhost is http:// — `secure` cookies would be silently dropped there.
    ...(typeof window !== "undefined" && window.location.protocol === "https:"
      ? { secure: true }
      : {}),
  });
  window.location.assign(to);
}

export function clearSessionAndRedirect(to = "/login") {
  Cookies.remove("auth_token", { path: "/" });
  window.location.assign(to);
}
