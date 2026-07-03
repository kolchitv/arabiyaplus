import * as pdfjsLib from "pdfjs-dist";
import { v4 as uuid } from "uuid";
import type { BookPage } from "@/types/book";
import { useMediaStore } from "@/store/mediaStore";

// Vite bundles the worker as a separate asset; this URL form works with
// both dev server and production build without extra config.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const RENDER_SCALE = 2; // ~192dpi equivalent for a crisp editable page

/**
 * Rasterizes every page of a PDF into a PNG, stores each as a media asset,
 * and returns one BookPage per PDF page ready to append to the book.
 * Each page keeps the PDF's native aspect ratio so hotspot placement lines
 * up exactly with the printed page.
 */
export async function importPdfAsPages(file: File, startOrder: number): Promise<BookPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const addFile = useMediaStore.getState().addFile;
  const pages: BookPage[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const pdfPage = await pdf.getPage(pageNum);
    const viewport = pdfPage.getViewport({ scale: RENDER_SCALE });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) continue;

    await pdfPage.render({ canvasContext: context, viewport, canvas }).promise;

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) continue;

    const imageFile = new File([blob], `${baseName}-page-${pageNum}.png`, { type: "image/png" });
    const asset = await addFile(imageFile, "backgrounds");

    pages.push({
      id: uuid(),
      order: startOrder + pageNum - 1,
      title: `${baseName} — صفحة ${pageNum}`,
      backgroundImageId: asset.id,
      width: canvas.width,
      height: canvas.height,
      hotspots: []
    });
  }

  return pages;
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf";
}
