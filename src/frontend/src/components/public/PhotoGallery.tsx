import type { Photo } from "@/backend";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { photoUrl } from "@/lib/photo";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Maximize2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface PhotoGalleryProps {
  photos: Photo[];
  /** Listing title, used for image alt text. */
  title: string;
  className?: string;
}

/** A single gallery entry with its resolved display URL. */
interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

/**
 * Editorial photo gallery: a large primary image, a thumbnail rail and a
 * full-screen lightbox with keyboard navigation.
 */
export function PhotoGallery({ photos, title, className }: PhotoGalleryProps) {
  const images: GalleryImage[] = photos
    .map((photo, index) => {
      const url = photoUrl(photo);
      if (!url) return null;
      return {
        id: `${photo.filename}-${index}`,
        url,
        alt: `${title} — photo ${index + 1}`,
      };
    })
    .filter((image): image is GalleryImage => image !== null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;
  const safeIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;
  const active = images[safeIndex];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setActiveIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goTo(safeIndex + 1);
      if (event.key === "ArrowLeft") goTo(safeIndex - 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, safeIndex, goTo]);

  if (!active) {
    return (
      <div
        data-ocid="listing_detail.gallery.empty_state"
        className={cn(
          "flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/50 text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="size-8" aria-hidden="true" />
        <p className="text-sm">
          No photos have been added to this property yet.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-muted shadow-subtle">
        <img
          src={active.url}
          alt={active.alt}
          data-ocid="listing_detail.gallery.primary_image"
          className="aspect-[16/10] w-full object-cover"
        />
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          data-ocid="listing_detail.gallery.open_modal_button"
          aria-label="Open full-screen photo viewer"
          className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-subtle backdrop-blur transition-smooth hover:bg-card hover:shadow-elevated focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Maximize2 className="size-4" aria-hidden="true" />
        </button>
        {count > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-foreground/70 px-3 py-1 font-mono text-xs text-background backdrop-blur">
            {safeIndex + 1} / {count}
          </span>
        ) : null}
      </div>

      {count > 1 ? (
        <ul
          data-ocid="listing_detail.gallery.thumbnail_list"
          className="grid grid-cols-4 gap-3 sm:grid-cols-5"
        >
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                data-ocid={`listing_detail.gallery.thumbnail.${index + 1}`}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === safeIndex}
                className={cn(
                  "block w-full overflow-hidden rounded-xl border-2 transition-smooth focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  index === safeIndex
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          data-ocid="listing_detail.gallery.modal"
          showCloseButton={false}
          className="max-w-5xl gap-0 border-none bg-foreground/95 p-0 text-background sm:rounded-2xl"
        >
          <DialogTitle className="sr-only">{title} — photo viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Use the arrow keys to move between photos, or press Escape to close.
          </DialogDescription>
          <div className="relative">
            <img
              src={active.url}
              alt={active.alt}
              className="max-h-[80vh] w-full rounded-t-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              data-ocid="listing_detail.gallery.close_button"
              aria-label="Close photo viewer"
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-background/15 text-background transition-smooth hover:bg-background/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-background/60"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => goTo(safeIndex - 1)}
                  data-ocid="listing_detail.gallery.pagination_prev"
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/15 text-background transition-smooth hover:bg-background/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-background/60"
                >
                  <ChevronLeft className="size-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(safeIndex + 1)}
                  data-ocid="listing_detail.gallery.pagination_next"
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/15 text-background transition-smooth hover:bg-background/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-background/60"
                >
                  <ChevronRight className="size-6" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
          <p className="px-5 py-4 text-center font-mono text-xs text-background/70">
            {safeIndex + 1} / {count}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
