/** One-shot observatory tick — synthesized so we don't ship a binary asset. */

const SOUND_KEY = "seismic-sound";

let ctx: AudioContext | null = null;
let muted = readMuted();
const listeners = new Set<() => void>();

function readMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SOUND_KEY) === "off";
  } catch {
    return false;
  }
}

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

export function isSoundMuted(): boolean {
  return muted;
}

export function setSoundMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(SOUND_KEY, next ? "off" : "on");
  } catch {
    /* ignore quota / private mode */
  }
  listeners.forEach((fn) => fn());
}

export function subscribeSoundMuted(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** Soft copper tick — safe to call from a user gesture (marker / feed click). */
export function playMarkerClick() {
  if (muted) return;

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
