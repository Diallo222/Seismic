/** One-shot observatory tick — synthesized so we don't ship a binary asset. */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx || ctx.state === "closed") ctx = new AC();
  return ctx;
}

/** Soft copper tick — safe to call from a user gesture (marker click). */
export function playMarkerClick() {
  const audio = getCtx();
  if (!audio) return;

  if (audio.state === "suspended") {
    void audio.resume();
  }

  const t0 = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(920, t0);
  osc.frequency.exponentialRampToValueAtTime(280, t0 + 0.07);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + 0.1);
}
