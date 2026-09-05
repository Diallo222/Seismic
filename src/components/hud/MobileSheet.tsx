import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { List, SlidersHorizontal, X } from "lucide-react";
import type { Quake } from "../../lib/types";
import { MagFilters } from "./Controls";
import { HudFrame } from "./HudFrame";
import { FeedList } from "../dashboard/FeedList";
import { StatCards } from "../dashboard/StatCards";
import { MagnitudeHistogram } from "../charts/MagnitudeHistogram";
import { TimelineChart } from "../charts/TimelineChart";
import { QuakeDetail } from "../dashboard/QuakeDetail";
import { LoadingSkeleton } from "./States";

type SheetTab = "feed" | "filters" | null;

export function MobileSheet({
  quakes,
  totalUnfiltered,
  selectedQuake,
  loading = false,
}: {
  quakes: Quake[];
  totalUnfiltered?: number;
  selectedQuake: Quake | null;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<SheetTab>(null);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[20] md:hidden">
      <div className="pointer-events-auto flex items-end gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1">
          {selectedQuake ? (
            <QuakeDetail quake={selectedQuake} mobile />
          ) : loading ? (
            <LoadingSkeleton />
          ) : (
            <StatCards quakes={quakes} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <IconFab
            label={t("mobileSheet.filters")}
            active={tab === "filters"}
            onClick={() => setTab((prev) => (prev === "filters" ? null : "filters"))}
          >
            <SlidersHorizontal size={16} />
          </IconFab>
          <IconFab
            label={t("mobileSheet.feed")}
            active={tab === "feed"}
            onClick={() => setTab((prev) => (prev === "feed" ? null : "feed"))}
          >
            <List size={16} />
          </IconFab>
        </div>
      </div>

      <AnimatePresence>
        {tab && (
          <motion.div
            key={tab}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="pointer-events-auto absolute inset-x-0 bottom-0 max-h-[70dvh]"
          >
            <HudFrame strong className="flex max-h-[70dvh] flex-col rounded-b-none border-b-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {tab === "feed" ? t("mobileSheet.eventFeed") : t("mobileSheet.filters")}
                </span>
                <button
                  onClick={() => setTab(null)}
                  aria-label={t("mobileSheet.closeSheet")}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  <X size={16} />
                </button>
              </div>

              {tab === "filters" && (
                <div className="space-y-4">
                  <MagFilters />
                  <div className="grid gap-3 border-t border-[var(--line)] pt-3">
                    <TimelineChart quakes={quakes} />
                    <MagnitudeHistogram quakes={quakes} />
                  </div>
                </div>
              )}

              {tab === "feed" && (
                loading ? (
                  <div className="space-y-2 py-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="skeleton h-9 w-full" />
                    ))}
                  </div>
                ) : (
                  <FeedList
                    quakes={quakes}
                    totalUnfiltered={totalUnfiltered}
                    className="max-h-[55dvh]"
                  />
                )
              )}
            </HudFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconFab({
  children,
  label,
  active,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border shadow-lg shadow-black/40 transition-colors ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--ink)]"
          : "border-[var(--line)] bg-[var(--glass-strong)] text-[var(--copper)] backdrop-blur-md hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}
