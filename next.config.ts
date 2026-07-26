import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

const isDev = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  // Turbopack HMR + stale chunk hashes must never drive SW precaching in dev.
  disable: isDev,
  register: !isDev,
  // Next build manifests often 404 at install time — keep them out of the SW list.
  exclude: [
    /\.map$/,
    /^manifest.*\.js$/,
    /^server\//,
    /^(((app-)?build-manifest|react-loadable-manifest|dynamic-css-manifest)\.json)$/,
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev runs on Turbopack (Serwist is disabled in development);
  // production builds use `next build --webpack` where Serwist hooks in.
  turbopack: {},
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: [
      "recharts",
      "lucide-react",
      "@react-three/drei",
      "framer-motion",
    ],
  },
};

export default withSerwist(nextConfig);
