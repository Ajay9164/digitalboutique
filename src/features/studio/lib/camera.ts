/**
 * Camera helpers for the Studio — navigator.mediaDevices.getUserMedia.
 */

export type CameraPermission = "prompt" | "granted" | "denied" | "unsupported";

export function isCameraSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

/**
 * Query Permission Status for camera when the Permissions API is available.
 * Falls back to "prompt" when unsupported (Safari often omits "camera").
 */
export async function getCameraPermission(): Promise<CameraPermission> {
  if (!isCameraSupported()) return "unsupported";

  try {
    if (!navigator.permissions?.query) return "prompt";
    const result = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    if (result.state === "granted") return "granted";
    if (result.state === "denied") return "denied";
    return "prompt";
  } catch {
    return "prompt";
  }
}

export function cameraErrorMessage(error: unknown): string {
  if (!(error instanceof DOMException) && !(error instanceof Error)) {
    return "Could not access the camera. Check permissions and try again.";
  }

  const name = "name" in error ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission denied. Enable camera access in your browser or system settings, then try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already in use by another application.";
  }
  if (name === "SecurityError") {
    return "Camera requires a secure context (HTTPS or localhost).";
  }
  return error.message || "Could not access the camera.";
}

export async function requestCameraStream(
  facingMode: "environment" | "user" = "environment",
): Promise<MediaStream> {
  if (!isCameraSupported()) {
    throw new Error("Camera is not supported in this browser.");
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
  } catch (error) {
    const primary = error;
    try {
      // Fallback without facingMode constraints (desktop webcams).
      return await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
    } catch {
      throw primary instanceof Error
        ? primary
        : new Error(cameraErrorMessage(primary));
    }
  }
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

/**
 * Freeze the current video frame onto a canvas and return a JPEG data URL.
 */
export function freezeVideoFrame(
  video: HTMLVideoElement,
  quality = 0.85,
): { dataUrl: string; width: number; height: number } {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context.");
  ctx.drawImage(video, 0, 0, width, height);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", quality),
    width,
    height,
  };
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
