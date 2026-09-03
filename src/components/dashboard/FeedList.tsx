import type { Quake } from "../../lib/types";
import { timeAgo } from "../../lib/format";
import { magToColor } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";

export function FeedList({ quakes }: { quakes: Quake[] }) {
  const selectedId = useDashboardStore((s) => s.selectedId);
  const select = useDashboardStore((s) => s.select);

  if (quakes.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/50">
        No quakes match current filters.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1 overflow-y-auto">
      {quakes.map((q) => (
        <li key={q.id}>
          <button
            onClick={() => select(q.id === selectedId ? null : q.id)}
            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors ${
              q.id === selectedId
                ? "bg-white/15"
                : "hover:bg-white/5"
            }`}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: magToColor(q.mag) }}
            />
            <span className="w-10 shrink-0 font-mono text-white/80">
              M{q.mag.toFixed(1)}
            </span>
            <span className="flex-1 truncate text-white/70">{q.place}</span>
            <span className="shrink-0 text-xs text-white/40">
              {timeAgo(q.time)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
