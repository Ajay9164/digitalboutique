import { describe, expect, it, vi } from "vitest";
import {
  cameraErrorMessage,
  freezeVideoFrame,
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

  it("rejects freeze when video has no dimensions", () => {
    const video = {
      videoWidth: 0,
      videoHeight: 0,
      readyState: 2,
    } as HTMLVideoElement;

    expect(() => freezeVideoFrame(video)).toThrow(/not ready/i);
  });

  it("freezes a paintable video frame to a jpeg data URL", () => {
    const drawImage = vi.fn();
    const toDataURL = vi.fn(
      () =>
        `data:image/jpeg;base64,${"A".repeat(80)}`,
    );
    const getContext = vi.fn(() => ({ drawImage }));

    vi.stubGlobal(
      "document",
      {
        createElement: () => ({
          width: 0,
          height: 0,
          getContext,
          toDataURL,
        }),
      } as unknown as Document,
    );

    const video = {
      videoWidth: 640,
      videoHeight: 480,
      readyState: 2, // HAVE_CURRENT_DATA
    } as HTMLVideoElement;

    const frame = freezeVideoFrame(video, { quality: 0.8, maxEdge: 320 });
    expect(frame.width).toBe(320);
    expect(frame.height).toBe(240);
    expect(frame.dataUrl.startsWith("data:image/jpeg")).toBe(true);
    expect(drawImage).toHaveBeenCalled();

    vi.unstubAllGlobals();
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
