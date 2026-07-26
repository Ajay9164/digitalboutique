/**
 * Dev-only: unregister leftover production Service Workers on localhost.
 * Serwist is disabled in development; stale workers from `next start` cause
 * bad-precaching-response / Turbopack 404 noise.
 */

const HELPER_SNIPPET = `navigator.serviceWorker.getRegistrations().then((rs) => Promise.all(rs.map((r) => r.unregister()))).then(() => caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))))`;

function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export function installDevServiceWorkerCleanup(): void {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window === "undefined") return;
  if (!isLocalhost()) return;
  if (!("serviceWorker" in navigator)) {
    console.info(
      "[tailor:dev] Service workers unavailable. Serwist stays off in development.",
    );
    return;
  }

  void (async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        console.info(
          "[tailor:dev] No active service workers. Serwist is disabled in development.\nHelper (manual unregister + cache clear):\n",
          HELPER_SNIPPET,
        );
        return;
      }

      await Promise.all(registrations.map((reg) => reg.unregister()));

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      console.info(
        `[tailor:dev] Unregistered ${registrations.length} stale service worker(s) on localhost and cleared Cache Storage.\nHard-refresh once if the UI still looks cached.\nHelper (re-run anytime):\n`,
        HELPER_SNIPPET,
      );
    } catch (error) {
      console.warn(
        "[tailor:dev] Could not clean service workers. Paste this in the console:\n",
        HELPER_SNIPPET,
        "\n",
        error,
      );
    }
  })();
}
