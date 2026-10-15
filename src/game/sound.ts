let ctx: AudioContext | null = null;

type Kind = "correct" | "wrong" | "click" | "hint" | "achievement";

const PATTERNS: Record<Kind, [number, number][]> = {
  click: [[520, 0.05]],
  correct: [[523, 0.1], [659, 0.1], [784, 0.18]],
  wrong: [[220, 0.15], [160, 0.25]],
  hint: [[880, 0.08], [660, 0.12]],
  achievement: [[523, 0.1], [784, 0.1], [1046, 0.1], [1318, 0.25]],
};

export function playSound(kind: Kind, volume: number) {
  if (typeof window === "undefined" || volume <= 0) return;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    let t = ctx.currentTime;
    for (const [freq, dur] of PATTERNS[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === "wrong" ? "sawtooth" : "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25 * volume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur;
    }
  } catch {
    /* audio unavailable */
  }
}
