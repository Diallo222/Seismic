import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { Quake } from "../../lib/types";
import { timeAgo } from "../../lib/format";
import { HudFrame } from "../hud/HudFrame";

/** Subtle count-up whenever the total ticks — the "genuinely new" cue on the card. */
function AnimatedCount({ value }: { value: number }) {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (v) =>
    Math.round(v).toLocaleString(),
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatCards({ quakes }: { quakes: Quake[] }) {
  const count = quakes.length;
  const maxMag = count ? Math.max(...quakes.map((q) => q.mag)) : 0;
  const avgDepth = count
    ? quakes.reduce((sum, q) => sum + q.depth, 0) / count
    : 0;
  const lastUpdated = count ? Math.max(...quakes.map((q) => q.time)) : null;

  const stats = [
    {
      label: "Quakes",
      value: <AnimatedCount value={count} />,
    },
    {
      label: "Largest",
      value: `M${maxMag.toFixed(1)}`,
    },
    {
      label: "Avg depth",
      value: `${avgDepth.toFixed(0)} km`,
    },
    {
      label: "Updated",
      value: lastUpdated ? timeAgo(lastUpdated) : "—",
    },
  ];

  return (
    <HudFrame className="pointer-events-auto flex divide-x divide-[var(--line)]">
      {stats.map((s) => (
        <div key={s.label} className="min-w-[4.5rem] px-3 py-2.5 md:min-w-[5.5rem]">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
            {s.label}
          </div>
          <div className="mt-0.5 font-mono text-base font-medium tabular text-[var(--ink)] md:text-lg">
            {s.value}
          </div>
        </div>
      ))}
    </HudFrame>
  );
}
