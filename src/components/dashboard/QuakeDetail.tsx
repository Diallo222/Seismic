import { AnimatePresence, motion } from "framer-motion";
import type { Quake } from "../../lib/types";
import { formatDepth, formatMag, timeAgo } from "../../lib/format";
import { magToColor } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";

export function QuakeDetail({ quake }: { quake: Quake | null }) {
  const select = useDashboardStore((s) => s.select);

  return (
    <AnimatePresence>
      {quake && (
        <motion.div
          key={quake.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute bottom-4 left-4 right-4 max-w-sm rounded-lg border border-white/10 bg-black/70 p-4 backdrop-blur-sm md:right-auto"
        >
          <button
            onClick={() => select(null)}
            aria-label="Close"
            className="absolute right-3 top-3 text-white/40 hover:text-white"
          >
            ✕
          </button>

          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: magToColor(quake.mag) }}
            />
            <span className="text-lg font-semibold text-white">
              M{formatMag(quake.mag)}
            </span>
            <span className="text-xs text-white/40">{timeAgo(quake.time)}</span>
          </div>

          <p className="mt-1 pr-4 text-sm text-white/70">{quake.place}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/50">
            <div>Depth: {formatDepth(quake.depth)}</div>
            <div>{quake.tsunami ? "⚠ Tsunami alert" : "No tsunami alert"}</div>
          </div>

          <a
            href={quake.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-sky-400 hover:underline"
          >
            View on USGS →
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
