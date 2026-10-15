import { useSyncExternalStore } from "react";
import { PUZZLES, STAGE_BASE_POINTS } from "./puzzles";
import { playSound } from "./sound";

export type Result = { points: number; hint: boolean; wrong: number };

export type GameState = {
  current: number; // index into PUZZLES
  score: number;
  results: Record<number, Result>;
  hintUsed: Record<number, boolean>;
  wrongCount: Record<number, number>;
  streak: number;
  bestStreak: number;
  achievements: string[];
  finished: boolean;
  plays: number;
  settings: { sound: boolean; volume: number; vibrate: boolean };
};

export const ACHIEVEMENTS = [
  { id: "first", title: "الشرارة الأولى", desc: "حلّ أول لغز", icon: "✦" },
  { id: "streak5", title: "عقل متّقد", desc: "5 إجابات صحيحة متتالية من المحاولة الأولى", icon: "🔥" },
  { id: "streak10", title: "لا يُوقَف", desc: "10 إجابات صحيحة متتالية من المحاولة الأولى", icon: "⚡" },
  { id: "stage1", title: "عابر العتبة", desc: "أنهِ المرحلة الأولى", icon: "🜂" },
  { id: "stage2", title: "سيد الظلال", desc: "أنهِ المرحلة الثانية", icon: "🜄" },
  { id: "stage3", title: "ما وراء الحافة", desc: "أنهِ المرحلة الثالثة", icon: "🜁" },
  { id: "nohint", title: "بلا عكّاز", desc: "أنهِ مرحلة كاملة دون تلميحات", icon: "👁" },
  { id: "perfect", title: "الكمال", desc: "أنهِ اللعبة دون أي خطأ أو تلميح", icon: "♛" },
  { id: "score5000", title: "جامع الأسرار", desc: "اجمع 5000 نقطة", icon: "💎" },
] as const;

const KEY = "mawara-almantiq-v1";

const initial = (): GameState => ({
  current: 0,
  score: 0,
  results: {},
  hintUsed: {},
  wrongCount: {},
  streak: 0,
  bestStreak: 0,
  achievements: [],
  finished: false,
  plays: 0,
  settings: { sound: true, volume: 0.7, vibrate: true },
});

let state: GameState = initial();
let loaded = false;
const listeners = new Set<() => void>();
let pendingAchievements: string[] = [];

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      state = { ...initial(), ...p, settings: { ...initial().settings, ...p.settings } };
    }
  } catch {
    /* ignore */
  }
}

function set(next: GameState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

const serverSnapshot = initial();
export function useGame() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => {
      load();
      return state;
    },
    () => serverSnapshot,
  );
}

export const getState = () => {
  load();
  return state;
};

export function sfx(kind: Parameters<typeof playSound>[0]) {
  const s = getState().settings;
  if (s.sound) playSound(kind, s.volume);
  if (s.vibrate && kind === "wrong" && typeof navigator !== "undefined") navigator.vibrate?.(120);
}

export function hasProgress(s: GameState) {
  return Object.keys(s.results).length > 0 && !s.finished;
}

export function takeHint(id: number) {
  const s = getState();
  if (s.hintUsed[id]) return;
  sfx("hint");
  set({ ...s, hintUsed: { ...s.hintUsed, [id]: true } });
}

export function pointsFor(id: number, s = getState()) {
  const p = PUZZLES.find((x) => x.id === id)!;
  let pts: number = STAGE_BASE_POINTS[p.stage];
  if (s.hintUsed[id]) pts *= 0.5;
  pts *= Math.pow(0.5, s.wrongCount[id] ?? 0);
  return Math.max(10, Math.round(pts));
}

/** returns true if correct */
export function answer(id: number, choice: number): boolean {
  const s = getState();
  const p = PUZZLES.find((x) => x.id === id)!;
  if (s.results[id]) return true;
  if (choice !== p.answer) {
    sfx("wrong");
    set({ ...s, wrongCount: { ...s.wrongCount, [id]: (s.wrongCount[id] ?? 0) + 1 }, streak: 0 });
    return false;
  }
  const pts = pointsFor(id, s);
  const clean = !s.hintUsed[id] && !(s.wrongCount[id] ?? 0);
  const streak = clean ? s.streak + 1 : 0;
  const next: GameState = {
    ...s,
    score: s.score + pts,
    results: { ...s.results, [id]: { points: pts, hint: !!s.hintUsed[id], wrong: s.wrongCount[id] ?? 0 } },
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
  };
  sfx("correct");
  set(checkAchievements(next));
  return true;
}

export function advance() {
  const s = getState();
  const nextIdx = s.current + 1;
  if (nextIdx >= PUZZLES.length) set({ ...s, finished: true, current: PUZZLES.length - 1 });
  else set({ ...s, current: nextIdx });
}

function checkAchievements(s: GameState): GameState {
  const got = new Set(s.achievements);
  const add = (id: string) => {
    if (!got.has(id)) {
      got.add(id);
      pendingAchievements.push(id);
    }
  };
  const solved = Object.keys(s.results).length;
  if (solved >= 1) add("first");
  if (s.streak >= 5) add("streak5");
  if (s.streak >= 10) add("streak10");
  if (s.score >= 5000) add("score5000");
  for (const st of [1, 2, 3] as const) {
    const ps = PUZZLES.filter((p) => p.stage === st);
    if (ps.every((p) => s.results[p.id])) {
      add(`stage${st}`);
      if (ps.every((p) => !s.results[p.id].hint)) add("nohint");
    }
  }
  if (solved === PUZZLES.length && Object.values(s.results).every((r) => !r.hint && !r.wrong)) add("perfect");
  return { ...s, achievements: [...got] };
}

export function takePendingAchievements() {
  const a = pendingAchievements;
  pendingAchievements = [];
  return a;
}

export function restart() {
  const s = getState();
  set({ ...initial(), achievements: s.achievements, settings: s.settings, plays: s.plays + 1, bestStreak: s.bestStreak });
}

export function resetAll() {
  set(initial());
}

export function updateSettings(patch: Partial<GameState["settings"]>) {
  const s = getState();
  set({ ...s, settings: { ...s.settings, ...patch } });
}
