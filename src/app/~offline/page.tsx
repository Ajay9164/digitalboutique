import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline Mode",
  description:
    "You are in Offline Mode. Your digital atelier is still fully functional.",
};

/**
 * Premium offline fallback — precached by Serwist as `/~offline`.
 * Luxury dark atelier aesthetic with champagne accents (no network assets).
 */
export default function OfflinePage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#07101A] px-6 text-center text-[#F4EFE6]">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(201,162,95,0.18), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(47,111,100,0.22), transparent 55%), linear-gradient(180deg, #0B1624 0%, #07101A 55%, #050B12 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,239,230,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(244,239,230,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-3xl border border-[#C9A25F]/25 bg-[#C9A25F]/10 shadow-[0_0_40px_-8px_rgba(201,162,95,0.55)]">
          <OfflineConnectionSvg />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C9A25F]">
          Offline Mode
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F4EFE6]">
          You are in Offline Mode
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#F4EFE6]/75">
          Your digital atelier is still fully functional. Access your saved
          measurements and drafts.
        </p>

        <Link
          href="/studio"
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#C9A25F] via-[#E2C48A] to-[#C9A25F] text-sm font-semibold tracking-wide text-[#07101A] shadow-[0_0_32px_-4px_rgba(201,162,95,0.75)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A25F]/70"
        >
          Return to Studio
        </Link>

        <div className="mt-4 flex justify-center gap-3 text-[11px] text-[#F4EFE6]/45">
          <Link href="/measurements" className="hover:text-[#C9A25F]">
            Measurements
          </Link>
          <span aria-hidden>·</span>
          <Link href="/drafts" className="hover:text-[#C9A25F]">
            Marking
          </Link>
          <span aria-hidden>·</span>
          <Link href="/" className="hover:text-[#C9A25F]">
            Academy
          </Link>
        </div>
      </div>
    </div>
  );
}

function OfflineConnectionSvg() {
  return (
    <svg
      viewBox="0 0 96 96"
      className="size-14"
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="offline-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C48A" />
          <stop offset="100%" stopColor="#C9A25F" />
        </linearGradient>
        <filter id="offline-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Severed connection line */}
      <path
        d="M18 48 H40"
        stroke="url(#offline-glow)"
        strokeWidth="3.5"
        strokeLinecap="round"
        filter="url(#offline-blur)"
      />
      <path
        d="M56 48 H78"
        stroke="url(#offline-glow)"
        strokeWidth="3.5"
        strokeLinecap="round"
        filter="url(#offline-blur)"
      />
      <circle
        cx="40"
        cy="48"
        r="4"
        fill="#C9A25F"
        filter="url(#offline-blur)"
      />
      <circle
        cx="56"
        cy="48"
        r="4"
        fill="#C9A25F"
        filter="url(#offline-blur)"
      />
      {/* Spark at the break */}
      <path
        d="M48 34 L50 44 L60 46 L50 48 L48 58 L46 48 L36 46 L46 44 Z"
        fill="#E2C48A"
        opacity="0.9"
        filter="url(#offline-blur)"
      />
      {/* Soft signal arcs */}
      <path
        d="M28 34 C34 28, 40 28, 44 34"
        stroke="#C9A25F"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M52 62 C58 68, 64 68, 70 62"
        stroke="#C9A25F"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
