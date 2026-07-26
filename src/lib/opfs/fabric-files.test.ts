import { describe, expect, it } from "vitest";
import {
  fabricFileName,
  isOpfsSupported,
} from "@/lib/opfs/fabric-files";
import {
  isWebAuthnSupported,
  journalLockErrorMessage,
} from "@/lib/webauthn/journal-lock";

describe("OPFS fabric files", () => {
  it("builds a stable jpeg filename from photo id", () => {
    expect(fabricFileName("abc-123")).toBe("abc-123.jpg");
  });

  it("reports OPFS support from navigator.storage.getDirectory", () => {
    const result = isOpfsSupported();
    expect(typeof result).toBe("boolean");
  });
});

describe("journal WebAuthn lock helpers", () => {
  it("detects WebAuthn presence as a boolean", () => {
    expect(typeof isWebAuthnSupported()).toBe("boolean");
  });

  it("maps NotAllowedError to a clear message", () => {
    const error = new DOMException("denied", "NotAllowedError");
    expect(journalLockErrorMessage(error)).toMatch(/dismissed|blocked/i);
  });

  it("maps SecurityError to HTTPS guidance", () => {
    const error = new DOMException("insecure", "SecurityError");
    expect(journalLockErrorMessage(error)).toMatch(/HTTPS|localhost/i);
  });

  it("falls back for unknown errors", () => {
    expect(journalLockErrorMessage("boom")).toMatch(/failed/i);
  });
});
