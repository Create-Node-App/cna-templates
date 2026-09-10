/**
 * Navigation helpers that are safe to call from client components and
 * straightforward to mock in unit tests (jsdom freezes
 * `window.location`, so tests stub this module instead).
 */

/**
 * Navigate to a URL, keeping navigation on the current origin.
 *
 * Auth.js may return an absolute callback URL containing a stale host (e.g.
 * behind a proxy); stripping it to path + search + hash avoids leaving the
 * app origin. Performs a full page load (not a client-side route change) so
 * the new session is picked up by the server on arrival.
 *
 * @param url - Absolute or relative destination URL.
 */
export function navigateToSameOrigin(url: string): void {
  const target = new URL(url, window.location.origin);
  window.location.assign(`${target.pathname}${target.search}${target.hash}`);
}
