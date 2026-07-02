import { v4 as uuid } from "uuid";
import type { Book, BookPage } from "@/types/book";
import type { MediaAsset } from "@/types/media";
import { useMediaStore } from "@/store/mediaStore";

const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/**
 * Imports one or more image files as new pages appended to the book.
 * Each image becomes a page background at its native resolution.
 * PDF import (page-by-page rasterization via pdf.js) lands in Phase 2 —
 * see importPdf() below for the integration point.
 */
export async function importImagesAsPages(files: File[], book: Book): Promise<BookPage[]> {
  const addFile = useMediaStore.getState().addFile;
  const newPages: BookPage[] = [];
  let order = book.pages.length;

  for (const file of files) {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) continue;
    const asset: MediaAsset = await addFile(file, "backgrounds");
    newPages.push({
      id: uuid(),
      order: order++,
      title: file.name.replace(/\.[^/.]+$/, ""),
      backgroundImageId: asset.id,
      width: asset.width || 1240,
      height: asset.height || 1754,
      hotspots: []
    });
  }
  return newPages;
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf";
}

/**
 * Phase 2 integration point: will use pdfjs-dist to rasterize each PDF
 * page onto a canvas, then hand the resulting image blobs to
 * importImagesAsPages()-style logic so every PDF page becomes an
 * editable page with hotspots.
 */
export async function importPdf(_file: File): Promise<BookPage[]> {
  throw new Error(
    "استيراد ملفات PDF قيد التطوير في المرحلة القادمة. حالياً يمكنك استيراد صور PNG/JPG/WEBP."
  );
}
