import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isImageFilename, photoUrl } from "@/lib/photo";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types/listing";
import { ExternalBlob } from "@caffeineai/object-storage";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

/** A file queued for upload, with its live progress percentage. */
interface UploadTask {
  id: string;
  name: string;
  progress: number;
}

interface PhotoUploaderProps {
  /** Photos already attached to the listing. */
  photos: Photo[];
  /** Persists the given photos against the listing. */
  onUpload: (photos: Photo[]) => Promise<void>;
  /** Removes the photo at the given index. */
  onRemove: (index: number) => Promise<void>;
  /** Disables every control while a parent mutation is in flight. */
  disabled?: boolean;
}

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif,image/avif";

/**
 * Drag-and-drop plus file-picker photo upload with per-file progress feedback,
 * thumbnail previews of attached photos and per-photo removal.
 */
export function PhotoUploader({
  photos,
  onUpload,
  onRemove,
  disabled = false,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const isUploading = tasks.length > 0;

  function updateTask(id: string, progress: number) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, progress } : task)),
    );
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((file) =>
      isImageFilename(file.name),
    );
    if (files.length === 0) {
      setError("Only image files can be attached to a listing.");
      return;
    }

    setError(null);
    const queued: UploadTask[] = files.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      name: file.name,
      progress: 0,
    }));
    setTasks(queued);

    try {
      const uploaded = await Promise.all(
        files.map(async (file, index) => {
          const id = queued[index].id;
          const bytes = new Uint8Array(await file.arrayBuffer());
          const blob = ExternalBlob.fromBytes(
            bytes,
            file.type,
            file.name,
          ).withUploadProgress((percentage) => updateTask(id, percentage));
          return { blob: blob as unknown as Uint8Array, filename: file.name };
        }),
      );
      await onUpload(uploaded);
      setTasks([]);
    } catch {
      setTasks([]);
      setError("The photos could not be uploaded. Please try again.");
    }
  }

  async function handleRemove(index: number) {
    setError(null);
    setRemovingIndex(index);
    try {
      await onRemove(index);
    } catch {
      setError("The photo could not be removed. Please try again.");
    } finally {
      setRemovingIndex(null);
    }
  }

  return (
    <div className="space-y-4">
      <div
        data-ocid="listing_photos.dropzone"
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-smooth",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-admin-border bg-background",
        )}
      >
        <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-foreground">
          Drag photos here, or choose files
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, WEBP, GIF or AVIF. Add several at once.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="sr-only"
          data-ocid="listing_photos.file_input"
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="listing_photos.upload_button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-md"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-4" aria-hidden="true" />
          )}
          {isUploading ? "Uploading…" : "Choose photos"}
        </Button>
      </div>

      {tasks.length > 0 ? (
        <ul
          data-ocid="listing_photos.upload_progress"
          aria-live="polite"
          className="space-y-2"
        >
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-md border border-admin-border bg-background px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate font-medium text-foreground">
                  {task.name}
                </span>
                <span className="tabular shrink-0 text-muted-foreground">
                  {task.progress}%
                </span>
              </div>
              <Progress value={task.progress} className="mt-2 h-1.5" />
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p
          data-ocid="listing_photos.error_state"
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul
          data-ocid="listing_photos.list"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {photos.map((photo, index) => {
            const url = photoUrl(photo);
            return (
              <li
                key={`${photo.filename}-${index}`}
                data-ocid={`listing_photos.item.${index + 1}`}
                className="group relative overflow-hidden rounded-lg border border-admin-border bg-muted"
              >
                <div className="aspect-[4/3] w-full">
                  {url ? (
                    <img
                      src={url}
                      alt={photo.filename}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <ImagePlus className="size-5" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-admin-border bg-background px-2 py-1.5">
                  <span className="min-w-0 truncate text-[0.7rem] text-muted-foreground">
                    {photo.filename}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${photo.filename}`}
                    data-ocid={`listing_photos.remove_button.${index + 1}`}
                    disabled={disabled || removingIndex !== null}
                    onClick={() => void handleRemove(index)}
                    className="size-7 shrink-0 rounded-md text-muted-foreground hover:text-destructive"
                  >
                    {removingIndex === index ? (
                      <Loader2
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p
          data-ocid="listing_photos.empty_state"
          className="text-xs text-muted-foreground"
        >
          No photos attached yet. Listings with photos attract far more
          enquiries.
        </p>
      )}
    </div>
  );
}
