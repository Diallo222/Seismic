import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { useState } from "react";
import type { Quake } from "../../lib/types";
import { MagFilters } from "./Controls";
import { HudFrame } from "./HudFrame";
import { FeedList } from "../dashboard/FeedList";

const PANEL_W = 320;

export function RightRail({
  quakes,
  totalUnfiltered,
  loading,
  defaultOpen = false,
}: {
  quakes: Quake[];
  totalUnfiltered?: number;
  loading: boolean;
  defaultOpen?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const count = loading
    ? "…"
    : quakes.length.toLocaleString(i18n.language, { numberingSystem: "latn" });

  return (
    <div className="pointer-events-none absolute bottom-28 end-0 top-20 z-[12] flex items-stretch">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="feed-rail-panel"
        aria-label={open ? t("rightRail.closePanel") : t("rightRail.openPanel")}
        className="pointer-events-auto relative z-10 my-auto flex h-28 w-9 cursor-pointer flex-col items-center justify-center gap-2 rounded-s-[var(--radius-md)] border border-e-0 border-[var(--line)] bg-[var(--glass-strong)] text-[var(--copper)] backdrop-blur-md transition-colors hover:text-[var(--ink)]"
      >
        <span className="inline-flex rtl:rotate-180" aria-hidden>
          {open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </span>
        <List size={14} />
        <span
          className="font-mono text-[9px] uppercase tracking-[0.18em]"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {t("rightRail.feedCount", { count })}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="feed-rail-panel"
            key="feed-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: PANEL_W, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="pointer-events-auto overflow-hidden"
          >
            <HudFrame className="ms-0 flex h-full w-[320px] flex-col gap-3 rounded-e-none border-e-0 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {t("rightRail.feed")}
                </span>
                <span className="font-mono text-[10px] tabular text-[var(--muted)]">
                  {count}
                </span>
              </div>
              <MagFilters />
              <div className="h-px bg-[var(--line)]" />
              {loading ? (
                <div className="space-y-2 py-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-9 w-full" />
                  ))}
                </div>
              ) : (
                <FeedList
                  quakes={quakes}
                  totalUnfiltered={totalUnfiltered}
                  className="min-h-0 flex-1"
                />
              )}
            </HudFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
