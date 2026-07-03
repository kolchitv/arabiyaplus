import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { FillBlankItem, TypingItem, AudioRecordingItem, PronunciationItem } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FillBlankRunner({ item, onSubmit }: { item: FillBlankItem; onSubmit: (r: Record<string, string>) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const parts = item.textWithBlanks.split(/(\{\{\d+\}\})/g);

  return (
    <div className="space-y-4">
      <p className="flex flex-wrap items-center gap-2 font-body text-base leading-loose text-ink dark:text-white">
        {parts.map((part, i) => {
          const match = part.match(/\{\{(\d+)\}\}/);
          if (!match) return <span key={i}>{part}</span>;
          const blankId = match[1];
          return (
            <Input
              key={i}
              className="inline-block w-28"
              value={answers[blankId] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [blankId]: e.target.value }))}
            />
          );
        })}
      </p>
      <Button
        variant="accent"
        disabled={item.blanks.some((b) => !answers[b.id]?.trim())}
        onClick={() => onSubmit(answers)}
      >
        تأكيد الإجابة
      </Button>
    </div>
  );
}

export function TypingRunner({ onSubmit }: { item: TypingItem; onSubmit: (r: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-4">
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="اكتب إجابتك هنا" />
      <Button variant="accent" disabled={!value.trim()} onClick={() => onSubmit(value)}>
        تأكيد الإجابة
      </Button>
    </div>
  );
}

function useRecorder(onDone: (blobUrl: string) => void) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onDone(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert("تعذّر الوصول إلى الميكروفون.");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  return { isRecording, start, stop };
}

export function AudioRecordingRunner({
  item,
  onSubmit
}: {
  item: AudioRecordingItem;
  onSubmit: (r: string) => void;
}) {
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const { isRecording, start, stop } = useRecorder(setRecordedUrl);

  return (
    <div className="space-y-4">
      <p className="font-ui text-sm text-ink dark:text-white">{item.instructions}</p>
      {recordedUrl && <audio controls src={recordedUrl} className="w-full" />}
      <Button variant={isRecording ? "destructive" : "outline"} onClick={isRecording ? stop : start}>
        {isRecording ? <Square size={14} /> : <Mic size={14} />} {isRecording ? "إيقاف التسجيل" : "بدء التسجيل"}
      </Button>
      <Button variant="accent" disabled={!recordedUrl} onClick={() => recordedUrl && onSubmit(recordedUrl)}>
        إرسال التسجيل للمراجعة
      </Button>
    </div>
  );
}

export function PronunciationRunner({
  item,
  onSubmit
}: {
  item: PronunciationItem;
  onSubmit: (r: string) => void;
}) {
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const { isRecording, start, stop } = useRecorder(setRecordedUrl);

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-canvas dark:bg-ink/40 p-4 text-center font-display text-xl text-ink dark:text-white">
        {item.targetText}
      </p>
      {recordedUrl && <audio controls src={recordedUrl} className="w-full" />}
      <Button variant={isRecording ? "destructive" : "outline"} onClick={isRecording ? stop : start}>
        {isRecording ? <Square size={14} /> : <Mic size={14} />} {isRecording ? "إيقاف التسجيل" : "سجّل نطقك"}
      </Button>
      <Button variant="accent" disabled={!recordedUrl} onClick={() => recordedUrl && onSubmit(recordedUrl)}>
        إرسال للمراجعة
      </Button>
    </div>
  );
}
