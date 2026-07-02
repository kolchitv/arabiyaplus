export type MediaFolder = "images" | "audio" | "videos" | "icons" | "backgrounds";

export type MediaKind = "image" | "audio" | "video";

export interface MediaAsset {
  id: string;
  folder: MediaFolder;
  kind: MediaKind;
  name: string;
  mimeType: string;
  /** Object URL / data URL used for in-session preview. */
  url: string;
  /** Raw bytes are kept in IndexedDB separately, keyed by this id. */
  sizeBytes: number;
  createdAt: string;
  durationSeconds?: number; // for audio/video
  width?: number; // for images
  height?: number;
}
