import { AnimatePresence, motion } from "framer-motion";
import type { Quake } from "../../lib/types";
import { magToColor } from "../../lib/geo";
import { formatMag } from "../../lib/format";
import { useEpicenterScreen } from "../../store/useEpicenterScreen";

/**
 * DOM HUD label for the selected epicenter. Lives outside the Canvas so it
 * never hits R3F's portal reconciler.
 */
export function EpicenterLabel({ quake }: { quake: Quake | null }) {
  const x = useEpicenterScreen((s) => s.x);
  const y = useEpicenterScreen((s) => s.y);
  const visible = useEpicenterScreen((s) => s.visible);

  return (
    <AnimatePresence>
      {quake && visible && (
        <motion.div
          key={quake.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-none absolute left-0 top-0 z-[15] hidden md:block"
          style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
        >
          <svg
            width="22"
            height="22"
            className="absolute -left-[22px] top-[14px] overflow-visible"
            aria-hidden
          >
            <line
              x1="20"
              y1="2"
              x2="4"
              y2="18"
              stroke="var(--copper)"
              strokeWidth="1"
              opacity="0.7"
            />
            <circle
              cx="4"
              cy="18"
              r="2.5"
              fill={magToColor(quake.mag)}
              stroke="var(--ink)"
              strokeWidth="0.75"
            />
          </svg>
          <div className="hud-glass-strong px-2.5 py-1.5 shadow-lg shadow-black/40">
            <div className="font-mono text-[12px] font-medium tabular text-[var(--ink)]">
              M{formatMag(quake.mag)}
            </div>
            <div className="max-w-[140px] truncate text-[10px] text-[var(--muted)]">
              {quake.place}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
