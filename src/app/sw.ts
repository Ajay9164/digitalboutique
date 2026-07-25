import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  NetworkFirst,
  NetworkOnly,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * App Router + Serwist:
 * - Navigation documents: NetworkFirst with offline fallback (never "no-response")
 * - Next.js RSC / flight fetches: NetworkOnly (avoid stale shell mismatches)
 * - Everything else: Serwist defaultCache
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
        networkTimeoutSeconds: 4,
        plugins: [
          {
            handlerDidError: async () => {
              const offline = await caches.match("/~offline");
              return (
                offline ??
                new Response("You are offline.", {
                  status: 503,
                  statusText: "Offline",
                  headers: { "Content-Type": "text/plain; charset=utf-8" },
                })
              );
            },
          },
        ],
      }),
    },
    {
      matcher: ({ request, url }) =>
        request.headers.get("RSC") === "1" ||
        request.headers.get("Next-Router-Prefetch") === "1" ||
        url.pathname.startsWith("/_next/data/"),
      // Always return a Response so the SW never emits FetchEvent "no-response".
      handler: new NetworkOnly({
        plugins: [
          {
            handlerDidError: async () =>
              new Response(null, {
                status: 503,
                statusText: "Offline",
                headers: { "Cache-Control": "no-store" },
              }),
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
