import type { FeedWindow } from "../../lib/types";
import { useDashboardStore } from "../../store/useDashboardStore";

const FEED_OPTIONS: { value: FeedWindow; label: string }[] = [
  { value: "hour", label: "Past hour" },
  { value: "day", label: "Past day" },
  { value: "week", label: "Past week" },
  { value: "significant_month", label: "Significant (month)" },
];

export function Filters() {
  const feed = useDashboardStore((s) => s.feed);
  const setFeed = useDashboardStore((s) => s.setFeed);
  const filters = useDashboardStore((s) => s.filters);
  const setFilters = useDashboardStore((s) => s.setFilters);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <select
        value={feed}
        onChange={(e) => setFeed(e.target.value as FeedWindow)}
        className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
      >
        {FEED_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="flex items-center justify-between text-xs text-white/60">
        <span>Min magnitude: {filters.minMag.toFixed(1)}</span>
        <input
          type="range"
          min={0}
          max={9}
          step={0.1}
          value={filters.minMag}
          onChange={(e) => setFilters({ minMag: Number(e.target.value) })}
          className="ml-2 flex-1"
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-white/60">
        <input
          type="checkbox"
          checked={filters.tsunamiOnly}
          onChange={(e) => setFilters({ tsunamiOnly: e.target.checked })}
        />
        Tsunami alerts only
      </label>
    </div>
  );
}
