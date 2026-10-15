import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, btn } from "@/components/Shell";
import { PUZZLES, STAGES, STAGE_BASE_POINTS } from "@/game/puzzles";
import { ACHIEVEMENTS, advance, answer, pointsFor, sfx, takeHint, takePendingAchievements, useGame } from "@/game/store";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "العب — ما وراء المنطق" },
      { name: "description", content: "حلّ الألغاز الغامضة واحدًا تلو الآخر واجمع النقاط." },
      { property: "og:title", content: "العب — ما وراء المنطق" },
      { property: "og:description", content: "حلّ الألغاز الغامضة واحدًا تلو الآخر واجمع النقاط." },
    ],
  }),
  component: Play,
});

function Play() {
  const s = useGame();
  const nav = useNavigate();
  const puzzle = PUZZLES[Math.min(s.current, PUZZLES.length - 1)]!;
  const stage = STAGES[puzzle.stage - 1]!;
  const solved = !!s.results[puzzle.id];
  const [wrongPick, setWrongPick] = useState<number[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [toast, setToast] = useState<string[]>([]);

  useEffect(() => setWrongPick([]), [puzzle.id]);
  useEffect(() => {
    if (s.finished) nav({ to: "/results" });
  }, [s.finished, nav]);

  const pick = (i: number) => {
    if (solved) return;
    const ok = answer(puzzle.id, i);
    if (!ok) {
      setWrongPick((w) => [...w, i]);
      setShakeKey((k) => k + 1);
    } else {
      const a = takePendingAchievements();
      if (a.length) {
        setTimeout(() => sfx("achievement"), 450);
        setToast(a);
        setTimeout(() => setToast([]), 3500);
      }
    }
  };

  const next = () => {
    sfx("click");
    advance();
  };

  const firstOfStage = PUZZLES.findIndex((p) => p.stage === puzzle.stage);
  const stageCount = PUZZLES.filter((p) => p.stage === puzzle.stage).length;
  const progress = ((s.current + (solved ? 1 : 0)) / PUZZLES.length) * 100;

  return (
    <Shell>
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          <div className="truncate text-xs text-muted-foreground">المرحلة {stage.id} · {stage.name}</div>
          <div className="font-display text-xl">اللغز {s.current - firstOfStage + 1} من {stageCount}</div>
        </div>
        <div className="shrink-0 rounded-2xl bg-secondary px-4 py-2 text-center">
          <div className="text-[10px] text-muted-foreground">النقاط</div>
          <div className="font-bold text-accent" data-testid="score">{s.score}</div>
        </div>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <article key={puzzle.id} className="glass p-5 animate-rise sm:p-7">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{"◆".repeat(puzzle.stage)}</span>
          <span>حتى {STAGE_BASE_POINTS[puzzle.stage]} نقطة</span>
          {s.streak > 1 && <span className="ms-auto text-accent">🔥 {s.streak}</span>}
        </div>
        <h2 className="text-xl leading-relaxed sm:text-2xl">{puzzle.question}</h2>

        <div key={shakeKey} className={`mt-6 grid gap-3 ${shakeKey ? "animate-shake" : ""}`}>
          {puzzle.options.map((o, i) => {
            const isWrong = wrongPick.includes(i);
            const isRight = solved && i === puzzle.answer;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={solved || isWrong}
                className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-start text-base transition active:scale-[0.98] ${
                  isRight
                    ? "border-success bg-success/20 text-foreground"
                    : isWrong
                      ? "border-destructive/60 bg-destructive/10 text-muted-foreground line-through"
                      : "border-border bg-secondary/50 hover:border-primary hover:bg-secondary"
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-sm">
                  {isRight ? "✓" : isWrong ? "✕" : "أبجد"[i]}
                </span>
                <span className="min-w-0">{o}</span>
              </button>
            );
          })}
        </div>

        {!solved && wrongPick.length > 0 && (
          <p className="mt-4 text-sm text-destructive">ليس هذا… المنطق يخدعك. حاول مجددًا (النقاط تقل).</p>
        )}

        {s.hintUsed[puzzle.id] && (
          <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/10 p-3 text-sm">💡 {puzzle.hint}</div>
        )}

        {solved ? (
          <div className="mt-5 animate-rise">
            <div className="rounded-2xl bg-success/15 p-4 text-sm">
              <div className="mb-1 font-bold text-success">أحسنت! +{s.results[puzzle.id]!.points} نقطة</div>
              {puzzle.explanation}
            </div>
            <button onClick={next} className={`${btn.primary} mt-4 w-full`}>
              {s.current + 1 >= PUZZLES.length ? "عرض النتائج" : PUZZLES[s.current + 1]!.stage !== puzzle.stage ? "المرحلة التالية ←" : "اللغز التالي ←"}
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {!s.hintUsed[puzzle.id] ? (
              <button onClick={() => takeHint(puzzle.id)} className="rounded-full border border-accent/40 px-4 py-2 text-sm text-accent hover:bg-accent/10">
                💡 تلميح (−50%)
              </button>
            ) : <span />}
            <span className="text-xs text-muted-foreground">قيمة الإجابة الآن: {pointsFor(puzzle.id, s)}</span>
          </div>
        )}
      </article>

      <Link to="/" className="mt-6 self-center text-sm text-muted-foreground hover:text-foreground">
        حُفظ تقدّمك تلقائيًا · العودة للرئيسية
      </Link>

      {toast.length > 0 && (
        <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm space-y-2">
          {toast.map((id) => {
            const a = ACHIEVEMENTS.find((x) => x.id === id)!;
            return (
              <div key={id} className="glass flex items-center gap-3 p-4 shadow-glow animate-rise">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="text-xs text-accent">إنجاز جديد!</div>
                  <div className="font-bold">{a.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
