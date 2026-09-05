import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, X } from "lucide-react";
import type { Quake } from "../../lib/types";
import { formatDepth, formatMag, timeAgo } from "../../lib/format";
import { magToColor } from "../../lib/geo";
import { useDashboardStore } from "../../store/useDashboardStore";
import { HudFrame } from "../hud/HudFrame";

export function QuakeDetail({
  quake,
  mobile = false,
}: {
  quake: Quake | null;
  mobile?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const select = useDashboardStore((s) => s.select);

  useEffect(() => {
    if (!quake) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quake, select]);

  return (
    <AnimatePresence>
      {quake && (
        <motion.div
          key={quake.id}
          initial={{ opacity: 0, y: mobile ? 24 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: mobile ? 16 : 8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-sm"
        >
          <HudFrame strong className="relative p-4">
            <button
              onClick={() => select(null)}
              aria-label={t("quakeDetail.closeDetail")}
              className="absolute end-2.5 top-2.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              <X size={16} strokeWidth={1.75} />
            </button>

            <div className="flex items-center gap-2.5 pe-8">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: magToColor(quake.mag) }}
              />
              <span className="font-mono text-xl font-medium tabular text-[var(--ink)]">
                M{formatMag(quake.mag)}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {timeAgo(quake.time)}
              </span>
            </div>

            <p className="mt-2 pe-6 text-sm leading-snug text-[var(--muted)]">
              {quake.place}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px] text-[var(--muted)]">
              <div>
                {t("quakeDetail.depth")}{" "}
                <span className="text-[var(--ink)]">
                  {formatDepth(quake.depth)}
                </span>
              </div>
              <div>
                {quake.tsunami ? (
                  <span className="text-[var(--accent)]">{t("quakeDetail.tsunamiAlert")}</span>
                ) : (
                  t("quakeDetail.noTsunamiAlert")
                )}
              </div>
              <div className="col-span-2 text-[var(--muted)]/70">
                {quake.lat.toLocaleString(i18n.language, { numberingSystem: "latn", maximumFractionDigits: 2, minimumFractionDigits: 2 })}°,{" "}
                {quake.lng.toLocaleString(i18n.language, { numberingSystem: "latn", maximumFractionDigits: 2, minimumFractionDigits: 2 })}°
              </div>
            </div>

            <a
              href={quake.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--copper)] transition-colors hover:text-[var(--ink)]"
            >
              {t("quakeDetail.viewOnUsgs")}
              <ArrowUpRight size={12} strokeWidth={1.75} className="rtl:-scale-x-100" aria-hidden />
            </a>
          </HudFrame>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
