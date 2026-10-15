import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { ACHIEVEMENTS, useGame } from "@/game/store";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "الإنجازات — ما وراء المنطق" },
      { name: "description", content: "الإنجازات التي فتحتها والتي لا تزال مخفية في ما وراء المنطق." },
      { property: "og:title", content: "الإنجازات — ما وراء المنطق" },
      { property: "og:description", content: "افتح كل الإنجازات الغامضة." },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const s = useGame();
  return (
    <Shell title="الإنجازات">
      <p className="mb-4 text-muted-foreground">فتحت {s.achievements.length} من {ACHIEVEMENTS.length}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const got = s.achievements.includes(a.id);
          return (
            <div key={a.id} className={`glass flex items-center gap-4 p-4 ${got ? "shadow-glow" : "opacity-50 grayscale"}`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl">{got ? a.icon : "🔒"}</span>
              <div className="min-w-0">
                <div className="font-bold">{a.title}</div>
                <div className="text-sm text-muted-foreground">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
