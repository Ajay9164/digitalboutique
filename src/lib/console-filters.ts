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

/** Chrome logs this as info/log when a custom Install CTA owns beforeinstallprompt. */
const SUPPRESSED_INFO_PATTERNS: RegExp[] = [
  /Banner not shown:\s*beforeinstallpromptevent\.preventDefault\(\) called/i,
];

let installed = false;

function textFromArgs(args: unknown[]): string {
  return args
    .map((arg) => (typeof arg === "string" ? arg : String(arg)))
    .join(" ");
}

function shouldSuppressWarn(text: string): boolean {
  return SUPPRESSED_WARN_PATTERNS.some((pattern) => pattern.test(text));
}

function shouldSuppressInfo(text: string): boolean {
  return SUPPRESSED_INFO_PATTERNS.some((pattern) => pattern.test(text));
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
    const text = textFromArgs(args);
    if (shouldSuppressWarn(text) || shouldSuppressInfo(text)) return;
    originalWarn(...args);
  };

  const originalInfo = console.info.bind(console);
  console.info = (...args: unknown[]) => {
    if (shouldSuppressInfo(textFromArgs(args))) return;
    originalInfo(...args);
  };

  const originalLog = console.log.bind(console);
  console.log = (...args: unknown[]) => {
    if (shouldSuppressInfo(textFromArgs(args))) return;
    originalLog(...args);
  };
}
