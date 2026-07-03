import { useRef, useState } from "react";
import type { Hotspot } from "@/types/book";
import { useMediaStore } from "@/store/mediaStore";

interface PopupState {
  title: string;
  content: string;
}

/**
 * Executes a hotspot's action when tapped in the reader.
 * Audio always stops any currently-playing clip before starting a new
 * one, per the spec ("stop current audio, play selected audio").
 */
export function useHotspotAction(onNavigate: (pageId: string) => void) {
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [previewMedia, setPreviewMedia] = useState<{ kind: "image" | "video"; url: string } | null>(
    null
  );
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const getAsset = useMediaStore((s) => s.getAsset);
  const hydrateBlobUrl = useMediaStore((s) => s.hydrateBlobUrl);

  async function resolveUrl(mediaId: string): Promise<string | undefined> {
    const asset = getAsset(mediaId);
    if (asset?.url) return asset.url;
    return hydrateBlobUrl(mediaId);
  }

  async function trigger(hotspot: Hotspot) {
    const action = hotspot.action;
    if (!action) return;

    switch (action.type) {
      case "playAudio": {
        const url = await resolveUrl(action.mediaId);
        if (!url) return;
        audioElRef.current?.pause();
        const audio = new Audio(url);
        audioElRef.current = audio;
        audio.play();
        break;
      }
      case "playVideo": {
        const url = await resolveUrl(action.mediaId);
        if (url) setPreviewMedia({ kind: "video", url });
        break;
      }
      case "showImage": {
        const url = await resolveUrl(action.mediaId);
        if (url) setPreviewMedia({ kind: "image", url });
        break;
      }
      case "showPopup":
        setPopup({ title: action.title, content: action.content });
        break;
      case "navigatePage":
        onNavigate(action.targetPageId);
        break;
      case "openUrl":
        window.open(action.url, "_blank", "noopener,noreferrer");
        break;
      case "askQuestion":
        if (action.quizId) setActiveQuizId(action.quizId);
        break;
      case "runAnimation":
        // Visual feedback is handled by the calling component via CSS/Framer Motion.
        break;
    }
  }

  return {
    trigger,
    popup,
    closePopup: () => setPopup(null),
    previewMedia,
    closePreview: () => setPreviewMedia(null),
    activeQuizId,
    closeQuiz: () => setActiveQuizId(null)
  };
}
