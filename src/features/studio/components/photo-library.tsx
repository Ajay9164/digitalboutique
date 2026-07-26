"use client";

import { Trash2 } from "lucide-react";
import { useStudioStore } from "@/stores/studio-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PhotoLibrary({ className }: { className?: string }) {
  const photos = useStudioStore((s) => s.photos);
  const activePhotoId = useStudioStore((s) => s.activePhotoId);
  const selectPhoto = useStudioStore((s) => s.selectPhoto);
  const deletePhoto = useStudioStore((s) => s.deletePhoto);

  if (photos.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No fabric photos saved yet. Capture one from the Camera tab.
      </p>
    );
  }

  return (
    <ul className={cn("grid grid-cols-3 gap-2", className)}>
      {photos.map((photo) => {
        const active = photo.id === activePhotoId;
        return (
          <li key={photo.id} className="relative">
            <button
              type="button"
              onClick={() => selectPhoto(photo.id)}
              aria-pressed={active}
              className={cn(
                "block w-full overflow-hidden rounded-xl ring-2 transition",
                active ? "ring-primary" : "ring-transparent hover:ring-border",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.dataUrl || photo.displayUrl}
                alt={photo.label}
                className="aspect-square w-full object-cover"
              />
            </button>
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              className="absolute right-1 top-1 rounded-full"
              aria-label={`Delete ${photo.label}`}
              onClick={() => void deletePhoto(photo.id)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
