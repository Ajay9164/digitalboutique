/**
 * Narrow console filters for known third-party / driver noise.
 * Only matches specific library or ANGLE messages — never swallows errors
 * or unrelated warnings.
 */

const SUPPRESSED_WARN_PATTERNS: RegExp[] = [
  // three r183+ vs R3F 9 internal Clock
  /THREE\.Clock:\s*This module has been deprecated\.?\s*Please use THREE\.Timer instead\.?/i,
  // ANGLE/HLSL translation noise from MeshPhysicalMaterial on Windows/DirectX
  /THREE\.WebGLProgram/i,
  /warning X4122/i,
];

let installed = false;

function shouldSuppressWarn(text: string): boolean {
  return SUPPRESSED_WARN_PATTERNS.some((pattern) => pattern.test(text));
}

/** @deprecated Prefer installConsoleWarnFilters — kept for call-site clarity. */
export function installThreeClockWarnFilter(): void {
  installConsoleWarnFilters();
}

export function installConsoleWarnFilters(): void {
  if (typeof console === "undefined" || installed) return;
  installed = true;

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const text = args
      .map((arg) => (typeof arg === "string" ? arg : String(arg)))
      .join(" ");
    if (shouldSuppressWarn(text)) return;
    originalWarn(...args);
  };
}
