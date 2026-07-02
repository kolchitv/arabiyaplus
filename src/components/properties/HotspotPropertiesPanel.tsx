import { useRef } from "react";
import { Trash2 } from "lucide-react";
import type { BookPage, HotspotAction, AnimationKind } from "@/types/book";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioActionFields } from "@/components/audio/AudioActionFields";
import { useBookStore } from "@/store/bookStore";
import { useMediaStore } from "@/store/mediaStore";

interface Props {
  page: BookPage;
  hotspotId: string;
  allPages: BookPage[];
}

type ActionKind = HotspotAction["type"];

const ACTION_LABELS: Record<ActionKind, string> = {
  playAudio: "تشغيل صوت",
  playVideo: "تشغيل فيديو",
  showImage: "عرض صورة",
  showPopup: "نافذة منبثقة",
  navigatePage: "الانتقال لصفحة",
  openUrl: "فتح رابط",
  askQuestion: "طرح سؤال",
  runAnimation: "تشغيل حركة"
};

const ANIMATIONS: AnimationKind[] = ["fade", "scale", "bounce", "slide", "glow", "pulse"];
const ANIMATION_LABELS: Record<AnimationKind, string> = {
  fade: "تلاشي",
  scale: "تكبير",
  bounce: "ارتداد",
  slide: "انزلاق",
  glow: "توهّج",
  pulse: "نبض"
};

export function HotspotPropertiesPanel({ page, hotspotId, allPages }: Props) {
  const hotspot = page.hotspots.find((h) => h.id === hotspotId);
  const { updateHotspot, deleteHotspot } = useBookStore();
  const addFile = useMediaStore((s) => s.addFile);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!hotspot) return null;

  function setAction(action: HotspotAction | null) {
    updateHotspot(page.id, hotspotId, { action });
  }

  function changeActionType(type: ActionKind) {
    const defaults: Record<ActionKind, HotspotAction> = {
      playAudio: { type: "playAudio", mediaId: "" },
      playVideo: { type: "playVideo", mediaId: "" },
      showImage: { type: "showImage", mediaId: "" },
      showPopup: { type: "showPopup", title: "", content: "" },
      navigatePage: { type: "navigatePage", targetPageId: page.id },
      openUrl: { type: "openUrl", url: "" },
      askQuestion: { type: "askQuestion", quizId: "" },
      runAnimation: { type: "runAnimation", animation: "fade" }
    };
    setAction(defaults[type]);
  }

  return (
    <aside className="flex h-full w-72 flex-col border-e border-ash/15 bg-white/60 dark:bg-ink-light/30 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-ash/15 p-3">
        <h2 className="font-display text-sm font-bold text-ink dark:text-white">خصائص العنصر</h2>
        <Button
          size="icon"
          variant="ghost"
          className="text-red-500"
          onClick={() => deleteHotspot(page.id, hotspotId)}
          title="حذف العنصر"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="space-y-4 p-3">
        <div>
          <Label htmlFor="hs-name">الاسم</Label>
          <Input
            id="hs-name"
            value={hotspot.name}
            onChange={(e) => updateHotspot(page.id, hotspotId, { name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>الموضع X</Label>
            <Input type="number" step="0.01" value={hotspot.x.toFixed(2)} readOnly />
          </div>
          <div>
            <Label>الموضع Y</Label>
            <Input type="number" step="0.01" value={hotspot.y.toFixed(2)} readOnly />
          </div>
        </div>

        <div>
          <Label htmlFor="hs-action">الإجراء عند النقر</Label>
          <select
            id="hs-action"
            className="h-10 w-full rounded-xl border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-3 text-sm font-ui text-ink dark:text-white"
            value={hotspot.action?.type ?? ""}
            onChange={(e) => changeActionType(e.target.value as ActionKind)}
          >
            <option value="" disabled>
              اختر إجراءً
            </option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {hotspot.action?.type === "playAudio" && (
          <AudioActionFields
            mediaId={hotspot.action.mediaId || null}
            onChange={(mediaId) => setAction({ type: "playAudio", mediaId: mediaId ?? "" })}
          />
        )}

        {hotspot.action?.type === "showImage" && (
          <div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => imageInputRef.current?.click()}>
              اختيار صورة
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const asset = await addFile(file, "images");
                setAction({ type: "showImage", mediaId: asset.id });
              }}
            />
          </div>
        )}

        {hotspot.action?.type === "playVideo" && (
          <div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => videoInputRef.current?.click()}>
              اختيار فيديو
            </Button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const asset = await addFile(file, "videos");
                setAction({ type: "playVideo", mediaId: asset.id });
              }}
            />
          </div>
        )}

        {hotspot.action?.type === "showPopup" && (
          <div className="space-y-2">
            <div>
              <Label>عنوان النافذة</Label>
              <Input
                value={hotspot.action.title}
                onChange={(e) =>
                  setAction({ type: "showPopup", title: e.target.value, content: hotspot.action!.type === "showPopup" ? hotspot.action.content : "" })
                }
              />
            </div>
            <div>
              <Label>المحتوى</Label>
              <Input
                value={hotspot.action.content}
                onChange={(e) =>
                  setAction({ type: "showPopup", title: hotspot.action!.type === "showPopup" ? hotspot.action.title : "", content: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {hotspot.action?.type === "navigatePage" && (
          <div>
            <Label>الصفحة الهدف</Label>
            <select
              className="h-10 w-full rounded-xl border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-3 text-sm font-ui text-ink dark:text-white"
              value={hotspot.action.targetPageId}
              onChange={(e) => setAction({ type: "navigatePage", targetPageId: e.target.value })}
            >
              {allPages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {hotspot.action?.type === "openUrl" && (
          <div>
            <Label>الرابط</Label>
            <Input
              placeholder="https://example.com"
              value={hotspot.action.url}
              onChange={(e) => setAction({ type: "openUrl", url: e.target.value })}
            />
          </div>
        )}

        {hotspot.action?.type === "askQuestion" && (
          <p className="font-ui text-xs text-ash">
            سيتم ربط هذا الإجراء بمنشئ الاختبارات (Quiz Builder) في المرحلة القادمة.
          </p>
        )}

        {hotspot.action?.type === "runAnimation" && (
          <div>
            <Label>نوع الحركة</Label>
            <select
              className="h-10 w-full rounded-xl border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-3 text-sm font-ui text-ink dark:text-white"
              value={hotspot.action.animation}
              onChange={(e) => setAction({ type: "runAnimation", animation: e.target.value as AnimationKind })}
            >
              {ANIMATIONS.map((a) => (
                <option key={a} value={a}>
                  {ANIMATION_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </aside>
  );
}
