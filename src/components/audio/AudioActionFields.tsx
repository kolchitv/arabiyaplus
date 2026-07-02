import { useRef, useState } from "react";
import { Mic, Upload, Play, Square as StopIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaStore } from "@/store/mediaStore";

interface Props {
  mediaId: string | null;
  onChange: (mediaId: string | null) => void;
}

/**
 * Shared audio control block used by hotspot audio actions.
 * Supports: upload MP3, record from microphone, preview, replace, delete.
 */
export function AudioActionFields({ mediaId, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const addFile = useMediaStore((s) => s.addFile);
  const getAsset = useMediaStore((s) => s.getAsset);
  const asset = mediaId ? getAsset(mediaId) : undefined;

  async function handleUpload(file: File) {
    const newAsset = await addFile(file, "audio");
    onChange(newAsset.id);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `تسجيل-${Date.now()}.webm`, { type: "audio/webm" });
        await handleUpload(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert("تعذّر الوصول إلى الميكروفون. تحقق من إذن المتصفح.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function togglePreview() {
    if (!asset?.url) return;
    if (!audioElRef.current) {
      audioElRef.current = new Audio(asset.url);
      audioElRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElRef.current.src = asset.url;
      audioElRef.current.play();
      setIsPlaying(true);
    }
  }

  return (
    <div className="space-y-2">
      {asset ? (
        <div className="flex items-center justify-between rounded-lg bg-canvas dark:bg-ink/40 px-3 py-2">
          <span className="truncate font-ui text-xs text-ink dark:text-white">{asset.name}</span>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={togglePreview}>
              {isPlaying ? <StopIcon size={13} /> : <Play size={13} />}
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onChange(null)}>
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      ) : (
        <p className="font-ui text-xs text-ash">لا يوجد ملف صوتي مرفق</p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={13} /> رفع MP3
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <Button
          size="sm"
          variant={isRecording ? "destructive" : "outline"}
          className="flex-1"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <Mic size={13} /> {isRecording ? "إيقاف التسجيل" : "تسجيل صوتي"}
        </Button>
      </div>
    </div>
  );
}
