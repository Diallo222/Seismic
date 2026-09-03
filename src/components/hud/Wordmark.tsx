import { useDashboardStore } from "../../store/useDashboardStore";

export function Wordmark() {
  const newIds = useDashboardStore((s) => s.newIds);
  const isHot = newIds.size > 0;

  return (
    <div className="pointer-events-auto select-none">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] md:text-3xl">
          Seismic
        </h1>
        <div className="flex items-center gap-1.5">
          <span
            className={`live-dot ${isHot ? "is-hot" : ""}`}
            aria-hidden
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]"
            aria-live="polite"
          >
            Live
            {isHot ? ` · +${newIds.size}` : ""}
          </span>
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Live earthquake activity, worldwide
      </p>
    </div>
  );
}
