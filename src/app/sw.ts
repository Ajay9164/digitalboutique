import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
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
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
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
