import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell, btn } from "@/components/Shell";
import { useGame, hasProgress, restart, sfx } from "@/game/store";
import { PUZZLES, STAGES } from "@/game/puzzles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ما وراء المنطق — لعبة ألغاز غامضة" },
      { name: "description", content: "أكثر من 30 لغزًا غريبًا في ثلاث مراحل تتصاعد صعوبتها. اجمع النقاط وافتح الإنجازات." },
      { property: "og:title", content: "ما وراء المنطق — لعبة ألغاز غامضة" },
      { property: "og:description", content: "هل يستطيع عقلك عبور ما وراء الحافة؟ ألغاز وتلميحات وإنجازات." },
    ],
  }),
  component: Home,
});

function Home() {
  const s = useGame();
  const nav = useNavigate();
  const resume = hasProgress(s);
  const solved = Object.keys(s.results).length;

  const start = () => {
    sfx("click");
    if (s.finished || !resume) restart();
    nav({ to: "/play" });
  };

  return (
    <Shell>
      <section className="flex flex-1 flex-col items-center justify-center py-6 text-center animate-rise">
        <img src="/icon-512.png" alt="عين غامضة داخل مثلث مستحيل" width={512} height={512} className="mb-6 h-44 w-44 rounded-[2rem] shadow-glow animate-float sm:h-56 sm:w-56" />
        <h1 className="text-5xl leading-tight text-gradient sm:text-6xl">ما وراء المنطق</h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          {PUZZLES.length} لغزًا يتحدّى ما تظنه بديهيًا. كلما تعمّقت، صار المنطق أغرب.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          {resume && (
            <Link to="/play" onClick={() => sfx("click")} className={btn.primary}>
              ▶ استئناف — اللغز {s.current + 1}
            </Link>
          )}
          <button onClick={start} className={resume ? btn.ghost : btn.primary}>
            {resume ? "↺ بدء لعبة جديدة" : s.finished ? "↺ العب من جديد" : "ابدأ اللعب"}
          </button>
          {s.finished && (
            <Link to="/results" className={btn.ghost}>📜 آخر النتائج</Link>
          )}
        </div>

        {solved > 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            النقاط: <span className="font-bold text-accent">{s.score}</span> · المحلول: {solved}/{PUZZLES.length}
          </p>
        )}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {STAGES.map((st) => (
          <div key={st.id} className="glass p-4 text-center">
            <div className="text-xs text-muted-foreground">المرحلة {st.id}</div>
            <div className="mt-1 font-display text-lg">{st.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{st.desc}</div>
          </div>
        ))}
      </section>
    </Shell>
  );
}
