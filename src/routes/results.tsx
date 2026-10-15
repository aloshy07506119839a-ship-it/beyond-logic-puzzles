import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell, btn } from "@/components/Shell";
import { PUZZLES, STAGES, STAGE_BASE_POINTS } from "@/game/puzzles";
import { ACHIEVEMENTS, restart, sfx, useGame } from "@/game/store";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "النتائج — ما وراء المنطق" },
      { name: "description", content: "نتيجتك النهائية وإحصاءات كل مرحلة في لعبة ما وراء المنطق." },
      { property: "og:title", content: "النتائج — ما وراء المنطق" },
      { property: "og:description", content: "نتيجتك النهائية وإحصاءات كل مرحلة." },
    ],
  }),
  component: Results,
});

const MAX = PUZZLES.reduce((a, p) => a + STAGE_BASE_POINTS[p.stage], 0);

function rank(pct: number) {
  if (pct >= 90) return "عقل ما وراء المنطق";
  if (pct >= 70) return "كاشف الأسرار";
  if (pct >= 50) return "سائر في الظلال";
  return "مبتدئ فضولي";
}

function Results() {
  const s = useGame();
  const nav = useNavigate();
  const r = Object.values(s.results);
  const pct = Math.round((s.score / MAX) * 100);

  return (
    <Shell title="النتائج">
      <div className="glass p-6 text-center animate-rise">
        <div className="text-sm text-muted-foreground">مجموع نقاطك</div>
        <div className="my-2 font-display text-6xl text-gradient">{s.score}</div>
        <div className="text-sm text-muted-foreground">من {MAX} ({pct}%)</div>
        <div className="mt-3 inline-block rounded-full bg-accent/15 px-4 py-1 text-accent">{rank(pct)}</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          ["محلولة", `${r.length}/${PUZZLES.length}`],
          ["تلميحات", r.filter((x) => x.hint).length],
          ["أفضل سلسلة", s.bestStreak],
        ].map(([k, v]) => (
          <div key={k} className="glass p-3">
            <div className="text-xl font-bold">{v}</div>
            <div className="text-xs text-muted-foreground">{k}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {STAGES.map((st) => {
          const ps = PUZZLES.filter((p) => p.stage === st.id);
          const pts = ps.reduce((a, p) => a + (s.results[p.id]?.points ?? 0), 0);
          return (
            <div key={st.id} className="glass flex items-center justify-between p-4">
              <span>{st.name}</span>
              <span className="text-accent">{pts} نقطة</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 glass p-4 text-sm">
        الإنجازات: {s.achievements.length}/{ACHIEVEMENTS.length}{" "}
        <span className="text-lg">{s.achievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.icon).join(" ")}</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          className={btn.primary}
          onClick={() => {
            sfx("click");
            restart();
            nav({ to: "/play" });
          }}
        >
          ↺ إعادة اللعب
        </button>
        <Link to="/achievements" className={btn.ghost}>🏆 الإنجازات</Link>
      </div>
    </Shell>
  );
}
