import type { Quake } from "../../lib/types";
import { timeAgo } from "../../lib/format";

export function StatCards({ quakes }: { quakes: Quake[] }) {
  const count = quakes.length;
  const maxMag = count ? Math.max(...quakes.map((q) => q.mag)) : 0;
  const avgDepth = count
    ? quakes.reduce((sum, q) => sum + q.depth, 0) / count
    : 0;
  const lastUpdated = count ? Math.max(...quakes.map((q) => q.time)) : null;

  const stats = [
    { label: "Quakes", value: count.toLocaleString() },
    { label: "Largest", value: `M${maxMag.toFixed(1)}` },
    { label: "Avg depth", value: `${avgDepth.toFixed(0)} km` },
    { label: "Updated", value: lastUpdated ? timeAgo(lastUpdated) : "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div className="text-xs text-white/50">{s.label}</div>
          <div className="text-xl font-semibold text-white">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
