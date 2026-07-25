/**
 * Narrow console filters for known third-party deprecation noise.
 * Only matches exact library messages — never swallows errors or unrelated warns.
 */

const CLOCK_DEPRECATION =
  /THREE\.Clock:\s*This module has been deprecated\.?\s*Please use THREE\.Timer instead\.?/i;

let installed = false;

export function installThreeClockWarnFilter(): void {
  if (typeof console === "undefined" || installed) return;
  installed = true;

  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const text = args
      .map((arg) => (typeof arg === "string" ? arg : String(arg)))
      .join(" ");
    if (CLOCK_DEPRECATION.test(text)) return;
    originalWarn(...args);
  };
}
