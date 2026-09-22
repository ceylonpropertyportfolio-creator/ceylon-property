import type { Photo } from "@/backend";
import { ExternalBlob } from "@caffeineai/object-storage";

const IMAGE_EXTENSION = /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i;

/** True when a filename looks like a displayable image. */
export function isImageFilename(filename: string): boolean {
  return IMAGE_EXTENSION.test(filename);
}

/**
 * Returns a displayable URL for a stored photo. Backend `Photo.blob` values are
 * `ExternalBlob`s at runtime, so the direct proxy URL is used when available.
 */
export function photoUrl(photo: Photo): string | null {
  const blob = photo.blob as unknown as ExternalBlob;
  if (blob && typeof blob.getDirectURL === "function") {
    const url = blob.getDirectURL();
    if (url) return url;
  }
  return null;
}

/**
 * Converts a browser `File` into the backend `Photo` shape, uploading the bytes
 * through the object-storage gateway.
 */
export async function fileToPhoto(file: File): Promise<Photo> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const blob = ExternalBlob.fromBytes(bytes, file.type, file.name);
  return { blob: blob as unknown as Uint8Array, filename: file.name };
}

/** Converts a list of browser files into backend photos, preserving order. */
export async function filesToPhotos(files: File[]): Promise<Photo[]> {
  return Promise.all(files.map((file) => fileToPhoto(file)));
}
