import { describe, expect, it } from "vitest";
import {
  cameraErrorMessage,
  isCameraSupported,
} from "@/features/studio/lib/camera";
import { capitalize, formatRelativeLabel } from "@/utils/format";

describe("camera helpers", () => {
  it("reports unsupported when mediaDevices is missing", () => {
    const original = globalThis.navigator;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {},
    });
    expect(isCameraSupported()).toBe(false);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: original,
    });
  });

  it("maps permission denial to a clear message", () => {
    const error = new DOMException("Denied", "NotAllowedError");
    expect(cameraErrorMessage(error)).toMatch(/permission denied/i);
  });

  it("maps missing devices", () => {
    const error = new DOMException("Missing", "NotFoundError");
    expect(cameraErrorMessage(error)).toMatch(/no camera/i);
  });
});

describe("format utils", () => {
  it("formats relative labels", () => {
    const now = new Date("2026-07-25T12:00:00Z");
    expect(formatRelativeLabel(now, now)).toBe("Just now");
    expect(
      formatRelativeLabel(new Date("2026-07-25T11:30:00Z"), now),
    ).toBe("30m ago");
  });

  it("capitalizes strings", () => {
    expect(capitalize("tailor")).toBe("Tailor");
    expect(capitalize("")).toBe("");
  });
});
