/**
 * Camera helpers for the Studio — navigator.mediaDevices.getUserMedia.
 * Offline-first: frames are frozen to JPEG data URLs and stored in IndexedDB.
 */

export type CameraPermission = "prompt" | "granted" | "denied" | "unsupported";

export type FrozenFrame = {
  dataUrl: string;
  width: number;
  height: number;
};

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
    // Permissions API may reject "camera" on some browsers — treat as undecided.
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
  if (name === "AbortError") {
    return "Camera start was interrupted. Tap Enable camera and try again.";
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

/**
 * Stop every track on a MediaStream so the camera LED turns off and the
 * device mic/camera hardware is released. Safe to call repeatedly.
 */
export function stopStream(stream: MediaStream | null | undefined): void {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    try {
      track.stop();
    } catch {
      // Already ended / browser quirk — ignore.
    }
  }
}

/** Detach a stream from a video element and stop its tracks. */
export function releaseVideoStream(video: HTMLVideoElement | null): void {
  if (!video) return;
  const stream = video.srcObject;
  if (stream instanceof MediaStream) {
    stopStream(stream);
  }
  video.srcObject = null;
  try {
    video.load();
  } catch {
    // Some browsers throw when load() is called mid-teardown.
  }
}

/**
 * Attach a MediaStream to a video element and wait until a frame is paintable.
 */
export async function attachStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Camera preview timed out. Check permissions, close other apps using the camera, and try again.",
        ),
      );
    }, 12_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("error", onError);
    };

    const onReady = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Camera preview failed to load."));
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      cleanup();
      resolve();
      return;
    }

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("error", onError);
  });

  try {
    await video.play();
  } catch (error) {
    // Autoplay policies rarely block muted playsInline video; surface if they do.
    throw new Error(cameraErrorMessage(error));
  }

  // Some devices fire loadeddata before dimensions settle — wait briefly.
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    await waitForVideoDimensions(video);
  }
}

async function waitForVideoDimensions(
  video: HTMLVideoElement,
  timeoutMs = 4000,
): Promise<void> {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    if (video.videoWidth > 0 && video.videoHeight > 0) return;
    await new Promise((r) => window.setTimeout(r, 50));
  }
  throw new Error(
    "Camera frame dimensions are unavailable. Try Flip camera or Enable again.",
  );
}

export type FreezeOptions = {
  quality?: number;
  maxEdge?: number;
};

/**
 * Freeze the current video frame onto a canvas and return a JPEG data URL.
 * Throws if the video has no drawable frame yet (the previous silent failure).
 */
export function freezeVideoFrame(
  video: HTMLVideoElement,
  options: FreezeOptions = {},
): FrozenFrame {
  const quality = options.quality ?? 0.82;
  const maxEdge = options.maxEdge ?? 1920;

  const srcW = video.videoWidth;
  const srcH = video.videoHeight;

  if (!srcW || !srcH) {
    throw new Error(
      "Camera frame is not ready yet. Wait until the Live preview is visible, then capture again.",
    );
  }

  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    throw new Error(
      "Camera is still buffering. Wait a moment for a clear Live preview, then capture.",
    );
  }

  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Could not create a drawing surface for the capture.");
  }

  try {
    ctx.drawImage(video, 0, 0, width, height);
  } catch {
    throw new Error(
      "Could not read the camera frame (security or hardware limit). Try HTTPS / another browser.",
    );
  }

  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  } catch {
    throw new Error("Could not encode the captured image.");
  }

  if (!dataUrl.startsWith("data:image/jpeg") || dataUrl.length < 64) {
    throw new Error("Capture produced an empty image. Retake under better light.");
  }

  return { dataUrl, width, height };
}

/**
 * Async capture that waits for a paintable frame before freezing.
 * Prefers requestVideoFrameCallback when the browser provides it.
 */
export async function captureVideoFrame(
  video: HTMLVideoElement,
  options?: FreezeOptions,
): Promise<FrozenFrame> {
  if (typeof video.requestVideoFrameCallback === "function") {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(
          new Error(
            "Timed out waiting for the next camera frame. Try again in a moment.",
          ),
        );
      }, 3000);
      video.requestVideoFrameCallback(() => {
        window.clearTimeout(timeout);
        resolve();
      });
    });
  } else if (
    video.videoWidth === 0 ||
    video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    await waitForVideoDimensions(video);
  }

  return freezeVideoFrame(video, options);
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
