"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Loader2,
  Lock,
  RefreshCw,
  Snowflake,
} from "lucide-react";
import {
  attachStreamToVideo,
  cameraErrorMessage,
  captureVideoFrame,
  getCameraPermission,
  isCameraSupported,
  requestCameraStream,
  stopStream,
  type CameraPermission,
} from "@/features/studio/lib/camera";
import { useStudioStore } from "@/stores/studio-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CameraCapture({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [permission, setPermission] = useState<CameraPermission>("prompt");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cameraError = useStudioStore((s) => s.cameraError);
  const setCameraError = useStudioStore((s) => s.setCameraError);
  const setCapturePreview = useStudioStore((s) => s.setCapturePreview);
  const saveCapture = useStudioStore((s) => s.saveCapture);
  const capturePreview = useStudioStore((s) => s.capturePreview);

  const refreshPermission = useCallback(async () => {
    const status = await getCameraPermission();
    setPermission(status);
    return status;
  }, []);

  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void getCameraPermission().then((status) => {
        if (!cancelled) setPermission(status);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const startCamera = useCallback(
    async (nextFacing: "environment" | "user" = facing) => {
      if (!isCameraSupported()) {
        setPermission("unsupported");
        setCameraError("Camera API is not available in this browser.");
        return;
      }

      setStarting(true);
      setCameraError(null);
      setStatusMessage(null);

      try {
        stopStream(streamRef.current);
        streamRef.current = null;

        const stream = await requestCameraStream(nextFacing);
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          throw new Error("Camera preview element is missing. Reload and try again.");
        }

        await attachStreamToVideo(video, stream);
        setLive(true);
        setPermission("granted");
        setCapturePreview(null);
        setStatusMessage("Camera ready — point at fabric and capture.");
      } catch (error) {
        stopStream(streamRef.current);
        streamRef.current = null;
        setLive(false);
        setCameraError(cameraErrorMessage(error));
        const status = await refreshPermission();
        if (status === "prompt") {
          setPermission("denied");
        }
      } finally {
        setStarting(false);
      }
    },
    [facing, refreshPermission, setCameraError, setCapturePreview],
  );

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) {
      setCameraError("Camera preview is unavailable. Enable the camera again.");
      return;
    }
    if (!live) {
      setCameraError("Enable the camera first, then tap Capture image.");
      return;
    }

    setCapturing(true);
    setCameraError(null);
    setStatusMessage(null);

    try {
      const frozen = await captureVideoFrame(video);
      setCapturePreview(frozen);
      stopStream(streamRef.current);
      streamRef.current = null;
      setLive(false);
      setStatusMessage("Frame captured — review it, then save.");
    } catch (error) {
      setCameraError(
        error instanceof Error ? error.message : "Failed to capture image.",
      );
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturePreview(null);
    setStatusMessage(null);
    setCameraError(null);
    void startCamera(facing);
  };

  const handleSave = async () => {
    if (!capturePreview) {
      setCameraError("Nothing to save. Capture an image first.");
      return;
    }

    setSaving(true);
    setCameraError(null);
    setStatusMessage(null);

    try {
      const saved = await saveCapture();
      if (!saved) {
        setCameraError("Save failed — no capture was available.");
        return;
      }
      setStatusMessage("Fabric photo saved on this device.");
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : "Could not save the fabric photo to local storage.",
      );
    } finally {
      setSaving(false);
    }
  };

  const flipCamera = () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    void startCamera(next);
  };

  const idleCopy =
    permission === "unsupported"
      ? "This browser does not expose a camera API."
      : permission === "denied"
        ? "Camera access is blocked. Open site settings, allow the camera, then tap Enable."
        : cameraError ??
          "Enable the camera with a tap — Tailor only requests access when you ask.";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-black shadow-[0_18px_50px_-24px_rgba(15,23,28,0.45)] dark:border-white/10">
        <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              capturePreview ? "opacity-0" : "opacity-100",
            )}
            aria-label="Live camera preview"
          />
          {capturePreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URL capture
            <img
              src={capturePreview.dataUrl}
              alt="Captured fabric"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          {!live && !capturePreview ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/95 px-6 text-center text-zinc-100 backdrop-blur-sm">
              {permission === "denied" ? (
                <Lock className="size-8 opacity-70" aria-hidden="true" />
              ) : (
                <CameraOff className="size-8 opacity-70" aria-hidden="true" />
              )}
              <p className="max-w-xs text-sm leading-relaxed text-zinc-300">
                {starting ? "Starting camera…" : idleCopy}
              </p>
              {permission !== "unsupported" ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl"
                  disabled={starting}
                  onClick={() => void startCamera(facing)}
                >
                  {starting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Camera aria-hidden="true" />
                  )}
                  {permission === "denied" ? "Try again" : "Enable camera"}
                </Button>
              ) : null}
            </div>
          ) : null}

          {capturePreview ? (
            <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
              Captured
            </div>
          ) : live ? (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
              Live
            </div>
          ) : null}
        </div>
      </div>

      {cameraError ? (
        <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-center text-xs text-destructive" role="alert">
          {cameraError}
        </p>
      ) : null}

      {statusMessage ? (
        <p
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary/10 px-3 py-2 text-center text-xs text-primary"
          role="status"
        >
          <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
          {statusMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-center gap-2">
        {capturePreview ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={handleRetake}
              disabled={saving || starting}
            >
              <RefreshCw aria-hidden="true" />
              Retake
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              {saving ? "Saving…" : "Save fabric photo"}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={flipCamera}
              disabled={!live || starting || capturing}
            >
              Flip
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={!live || starting || capturing}
              onClick={() => void handleCapture()}
            >
              {capturing ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Snowflake aria-hidden="true" />
              )}
              {capturing ? "Capturing…" : "Capture image"}
            </Button>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Point at fabric under good light, capture the image, then save it locally
        for pattern overlay. Camera access requires HTTPS (or localhost).
      </p>
    </div>
  );
}
