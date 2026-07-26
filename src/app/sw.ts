import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, SerwistPlugin } from "serwist";
import {
  CacheFirst,
  NetworkFirst,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/** Build artifacts that commonly 404 during SW install (Next App Router). */
const SKIP_PRECACHE =
  /(dynamic-css-manifest|react-loadable-manifest|(app-)?build-manifest)\.json$|\.map$/i;

const SKIP_HEADER = "X-Serwist-Precache-Skip";

function sanitizePrecacheEntries(
  entries: (PrecacheEntry | string)[] | undefined,
): (PrecacheEntry | string)[] {
  if (!entries?.length) return [];
  return entries.filter((entry) => {
    const url = typeof entry === "string" ? entry : entry.url;
    if (!url) return false;
    return !SKIP_PRECACHE.test(url);
  });
}

/**
 * Soft-fail missing precache URLs so one 404 chunk cannot abort SW install
 * (`Uncaught (in promise) bad-precaching-response`).
 */
const resilientPrecachePlugin: SerwistPlugin = {
  fetchDidSucceed: async ({ response, request }) => {
    if (response.ok) return response;
    console.warn(
      "[serwist] Skipping non-OK precache response:",
      request.url,
      response.status,
    );
    return new Response("", {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        [SKIP_HEADER]: "1",
      },
    });
  },
  handlerDidError: async ({ request, error }) => {
    const detail = error instanceof Error ? error.message : String(error);
    console.warn(
      "[serwist] Skipping failed precache entry:",
      request.url,
      detail,
    );
    return new Response("", {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        [SKIP_HEADER]: "1",
      },
    });
  },
  cacheWillUpdate: async ({ response }) => {
    if (!response || response.status !== 200) return null;
    if (response.headers.get(SKIP_HEADER) === "1") return null;
    return response;
  },
};

function isRscPayload(request: Request, url: URL): boolean {
  if (request.headers.get("RSC") === "1") return true;
  if (request.headers.get("Next-Router-Prefetch") === "1") return true;
  if (request.headers.get("Next-Router-State-Tree") != null) return true;
  if (url.pathname.endsWith(".rsc")) return true;
  if (url.searchParams.has("_rsc")) return true;
  return url.pathname.startsWith("/_next/data/");
}

/**
 * App Router + Serwist (offline-first atelier):
 * - Navigations: NetworkFirst → /~offline
 * - RSC / flight payloads: NetworkFirst (fast timeout) with cache fallback
 * - `/_next/static/*` JS/CSS/chunks: aggressive CacheFirst
 * - Fonts / media: CacheFirst
 */
const serwist = new Serwist({
  precacheEntries: sanitizePrecacheEntries(self.__SW_MANIFEST),
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    plugins: [resilientPrecachePlugin],
  },
  runtimeCaching: [
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "tailor-pages",
        networkTimeoutSeconds: 3,
        plugins: [
          {
            handlerDidError: async () => {
              const offline = await caches.match("/~offline");
              return (
                offline ??
                new Response(null, {
                  status: 503,
                  statusText: "Offline",
                  headers: { "Cache-Control": "no-store" },
                })
              );
            },
          },
        ],
      }),
    },
    {
      // App Router RSC / flight payloads — must be cacheable for offline nav
      matcher: ({ request, url }) => isRscPayload(request, url),
      handler: new NetworkFirst({
        cacheName: "tailor-rsc",
        networkTimeoutSeconds: 2,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) =>
              response && response.status === 200 ? response : null,
            handlerDidError: async ({ request }) => {
              const cached = await caches.match(request, {
                cacheName: "tailor-rsc",
                ignoreVary: true,
              });
              if (cached) return cached;
              const offline = await caches.match("/~offline");
              return (
                offline ??
                new Response(null, {
                  status: 503,
                  statusText: "Offline",
                  headers: { "Cache-Control": "no-store" },
                })
              );
            },
          },
        ],
      }),
    },
    {
      // Aggressively cache every Next static chunk (JS, CSS, media, maps)
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "tailor-static",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) =>
              response && response.status === 200 ? response : null,
          },
        ],
      }),
    },
    {
      matcher: ({ request, url }) =>
        request.destination === "font" ||
        url.hostname === "fonts.gstatic.com" ||
        url.hostname === "fonts.googleapis.com",
      handler: new CacheFirst({
        cacheName: "tailor-fonts",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) =>
              response && response.status === 200 ? response : null,
          },
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.mode === "navigate" || request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
