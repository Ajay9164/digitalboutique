"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Lock, RefreshCw, Snowflake } from "lucide-react";
import {
  cameraErrorMessage,
  freezeVideoFrame,
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
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [permission, setPermission] = useState<CameraPermission>("prompt");

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

  // Soft-check permission without blocking first paint (avoids sync setState in effect).
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

  const startCamera = useCallback(
    async (nextFacing: "environment" | "user" = facing) => {
      if (!isCameraSupported()) {
        setPermission("unsupported");
        setCameraError("Camera API is not available in this browser.");
        return;
      }

      setStarting(true);
      setCameraError(null);

      try {
        stopStream(streamRef.current);
        const stream = await requestCameraStream(nextFacing);
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setLive(true);
        setPermission("granted");
        setCapturePreview(null);
      } catch (error) {
        setCameraError(cameraErrorMessage(error));
        setLive(false);
        const status = await refreshPermission();
        if (status === "prompt") {
          // Browser may still report prompt after a denial without Permissions API.
          setPermission("denied");
        }
      } finally {
        setStarting(false);
      }
    },
    [facing, refreshPermission, setCameraError, setCapturePreview],
  );

  const handleFreeze = () => {
    const video = videoRef.current;
    if (!video || !live) return;
    try {
      const frozen = freezeVideoFrame(video);
      setCapturePreview(frozen);
      stopStream(streamRef.current);
      streamRef.current = null;
      setLive(false);
    } catch (error) {
      setCameraError(
        error instanceof Error ? error.message : "Failed to freeze frame.",
      );
    }
  };

  const handleRetake = () => {
    setCapturePreview(null);
    void startCamera(facing);
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
              alt="Frozen fabric capture"
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
                  <Camera aria-hidden="true" />
                  {permission === "denied" ? "Try again" : "Enable camera"}
                </Button>
              ) : null}
            </div>
          ) : null}

          {capturePreview ? (
            <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
              Frozen
            </div>
          ) : live ? (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
              Live
            </div>
          ) : null}
        </div>
      </div>

      {cameraError && live ? (
        <p className="text-center text-xs text-destructive" role="alert">
          {cameraError}
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
            >
              <RefreshCw aria-hidden="true" />
              Retake
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => void saveCapture()}
            >
              Save fabric photo
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={flipCamera}
              disabled={!live || starting}
            >
              Flip
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={!live || starting}
              onClick={handleFreeze}
            >
              <Snowflake aria-hidden="true" />
              Freeze frame
            </Button>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Point at fabric under good light, freeze the frame, then save it locally
        for pattern overlay. Camera access requires HTTPS (or localhost).
      </p>
    </div>
  );
}
