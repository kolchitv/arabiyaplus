import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { MediaAsset, MediaFolder } from "@/types/media";
import { saveMediaBlob, loadMediaBlob } from "@/services/db";

interface MediaState {
  assets: MediaAsset[];
  addFile: (file: File, folder: MediaFolder) => Promise<MediaAsset>;
  getAsset: (id: string) => MediaAsset | undefined;
  removeAsset: (id: string) => void;
  hydrateBlobUrl: (id: string) => Promise<string | undefined>;
}

function kindFromMime(mime: string): MediaAsset["kind"] {
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "image";
}

export const useMediaStore = create<MediaState>((set, get) => ({
  assets: [],

  addFile: async (file, folder) => {
    const id = uuid();
    await saveMediaBlob(id, file);
    const url = URL.createObjectURL(file);
    const kind = kindFromMime(file.type);

    let width: number | undefined;
    let height: number | undefined;
    if (kind === "image") {
      const dims = await readImageDimensions(url);
      width = dims.width;
      height = dims.height;
    }

    const asset: MediaAsset = {
      id,
      folder,
      kind,
      name: file.name,
      mimeType: file.type,
      url,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
      width,
      height
    };
    set((s) => ({ assets: [...s.assets, asset] }));
    return asset;
  },

  getAsset: (id) => get().assets.find((a) => a.id === id),

  removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),

  // Restores a usable object URL for an asset after a page reload, since
  // blob: URLs don't survive across sessions — only the raw bytes do.
  hydrateBlobUrl: async (id) => {
    const blob = await loadMediaBlob(id);
    if (!blob) return undefined;
    const url = URL.createObjectURL(blob);
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? { ...a, url } : a))
    }));
    return url;
  }
}));

function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}
