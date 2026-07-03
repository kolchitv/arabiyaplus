import { v4 as uuid } from "uuid";
import type { Book, BookPage } from "@/types/book";
import type { MediaAsset } from "@/types/media";
import { useMediaStore } from "@/store/mediaStore";
import { importPdfAsPages, isPdfFile } from "@/services/pdfImport";

const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/**
 * Imports one or more image files as new pages appended to the book.
 * Each image becomes a page background at its native resolution.
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

/**
 * Imports a mixed batch of files (images and/or PDFs) as new pages,
 * appended in the order the files were selected. Each PDF is expanded
 * into one page per PDF page automatically.
 */
export async function importFilesAsPages(files: File[], book: Book): Promise<BookPage[]> {
  const allPages: BookPage[] = [];
  let order = book.pages.length;

  for (const file of files) {
    if (isPdfFile(file)) {
      const pdfPages = await importPdfAsPages(file, order);
      allPages.push(...pdfPages);
      order += pdfPages.length;
    } else if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      const [page] = await importImagesAsPages([file], { ...book, pages: [] });
      if (page) {
        allPages.push({ ...page, order });
        order += 1;
      }
    }
  }
  return allPages;
}

export { isPdfFile };
