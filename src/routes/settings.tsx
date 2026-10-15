import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { resetAll, sfx, updateSettings, useGame } from "@/game/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — ما وراء المنطق" },
      { name: "description", content: "تحكّم بالمؤثرات الصوتية والاهتزاز وتقدّمك في اللعبة." },
      { property: "og:title", content: "الإعدادات — ما وراء المنطق" },
      { property: "og:description", content: "تحكّم بالمؤثرات الصوتية والاهتزاز." },
    ],
  }),
  component: Settings,
});

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 p-4">
      <span>{label}</span>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-gradient-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-foreground transition-all ${on ? "start-6" : "start-1"}`} />
      </button>
    </label>
  );
}

function Settings() {
  const { settings } = useGame();
  return (
    <Shell title="الإعدادات">
      <div className="glass divide-y divide-border">
        <Toggle label="المؤثرات الصوتية" on={settings.sound} onChange={(v) => { updateSettings({ sound: v }); if (v) sfx("click"); }} />
        <div className="p-4">
          <div className="mb-2 flex justify-between"><span>مستوى الصوت</span><span className="text-muted-foreground">{Math.round(settings.volume * 100)}%</span></div>
          <input
            type="range" min={0} max={1} step={0.05} value={settings.volume} disabled={!settings.sound}
            onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
            onPointerUp={() => sfx("correct")}
            className="w-full accent-primary" aria-label="مستوى الصوت"
          />
        </div>
        <Toggle label="الاهتزاز عند الخطأ" on={settings.vibrate} onChange={(v) => updateSettings({ vibrate: v })} />
      </div>

      <div className="glass mt-6 p-4">
        <div className="mb-1 font-bold">📲 تثبيت كتطبيق</div>
        <p className="text-sm text-muted-foreground">
          على الهاتف: افتح قائمة المتصفح واختر «إضافة إلى الشاشة الرئيسية». على الكمبيوتر: اضغط أيقونة التثبيت في شريط العنوان.
        </p>
      </div>

      <button
        onClick={() => { if (confirm("سيتم حذف كل التقدّم والإنجازات. متأكد؟")) resetAll(); }}
        className="mt-6 rounded-2xl border border-destructive/50 p-4 text-destructive hover:bg-destructive/10"
      >
        حذف كل التقدّم
      </button>
    </Shell>
  );
}
