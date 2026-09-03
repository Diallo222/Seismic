import type { Quake } from "../../lib/types";
import { timeAgo } from "../../lib/format";
import { magToColor } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";

export function FeedList({
  quakes,
  className = "",
}: {
  quakes: Quake[];
  className?: string;
}) {
  const selectedId = useDashboardStore((s) => s.selectedId);
  const select = useDashboardStore((s) => s.select);
  const filters = useDashboardStore((s) => s.filters);
  const newIds = useDashboardStore((s) => s.newIds);

  if (quakes.length === 0) {
    return (
      <div className="px-1 py-6 text-center text-sm text-[var(--muted)]">
        No quakes match current filters
        {filters.minMag > 0 && (
          <span className="block font-mono text-xs mt-1 text-[var(--muted)]/70">
            M ≥ {filters.minMag.toFixed(1)}
            {filters.tsunamiOnly ? " · tsunami only" : ""}
          </span>
        )}
        {filters.minMag === 0 && filters.tsunamiOnly && (
          <span className="block font-mono text-xs mt-1 text-[var(--muted)]/70">
            tsunami alerts only
          </span>
        )}
      </div>
    );
  }

  return (
    <ul className={`flex flex-col gap-0.5 overflow-y-auto ${className}`}>
      {quakes.map((q) => {
        const selected = q.id === selectedId;
        const isNew = newIds.has(q.id);
        return (
          <li key={q.id}>
            <button
              onClick={() => select(q.id === selectedId ? null : q.id)}
              className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-sm transition-colors duration-200 ${
                selected
                  ? "bg-[var(--accent)]/20 ring-1 ring-[var(--accent)]/50"
                  : "hover:bg-[var(--line)]"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${isNew ? "ring-2 ring-[var(--copper)]/60" : ""}`}
                style={{ backgroundColor: magToColor(q.mag) }}
              />
              <span className="w-11 shrink-0 font-mono text-[13px] tabular text-[var(--ink)]">
                M{q.mag.toFixed(1)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--muted)]">
                {q.place}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]/70">
                {timeAgo(q.time)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
