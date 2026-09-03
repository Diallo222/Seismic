import { useTranslation } from "react-i18next";
import type { FeedWindow } from "../../lib/types";
import { MAG_COLOR_STOPS } from "../../lib/geo";
import { formatMag } from "../../lib/format";
import { useDashboardStore } from "../../store/useDashboardStore";

const FEED_OPTIONS: { value: FeedWindow; labelKey: string; short: string }[] = [
  { value: "hour", labelKey: "controls.feed.hour", short: "1H" },
  { value: "day", labelKey: "controls.feed.day", short: "1D" },
  { value: "week", labelKey: "controls.feed.week", short: "1W" },
  { value: "significant_month", labelKey: "controls.feed.significant", short: "SIG" },
];

export function FeedPills() {
  const { t } = useTranslation();
  const feed = useDashboardStore((s) => s.feed);
  const setFeed = useDashboardStore((s) => s.setFeed);

  return (
    <div
      className="pointer-events-auto flex gap-0.5 hud-glass p-1"
      role="tablist"
      aria-label={t("controls.feedWindow")}
    >
      {FEED_OPTIONS.map((opt) => {
        const active = feed === opt.value;
        const label = t(opt.labelKey);
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => setFeed(opt.value)}
            title={label}
            className={`min-h-9 shrink-0 cursor-pointer rounded-[var(--radius-sm)] px-2 font-mono text-[10px] tracking-wide transition-colors duration-200 sm:px-2.5 sm:text-[11px] ${
              active
                ? "bg-[var(--accent)] text-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <span className="md:hidden">{opt.short}</span>
            <span className="hidden md:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MagFilters() {
  const { t } = useTranslation();
  const filters = useDashboardStore((s) => s.filters);
  const setFilters = useDashboardStore((s) => s.setFilters);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          <span>{t("controls.minMagnitude")}</span>
          <span className="text-[var(--copper)]">
            M{formatMag(filters.minMag)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={9}
          step={0.1}
          value={filters.minMag}
          onChange={(e) => setFilters({ minMag: Number(e.target.value) })}
          className="mag-slider w-full cursor-pointer"
          aria-valuemin={0}
          aria-valuemax={9}
          aria-valuenow={filters.minMag}
          aria-label={t("controls.minMagnitudeAria")}
        />
      </label>

      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-xs text-[var(--muted)]">
        <input
          type="checkbox"
          checked={filters.tsunamiOnly}
          onChange={(e) => setFilters({ tsunamiOnly: e.target.checked })}
          className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
        />
        {t("controls.tsunamiOnly")}
      </label>
    </div>
  );
}

export function MagLegend() {
  const { t } = useTranslation();
  return (
    <div className="pointer-events-auto hud-glass px-3 py-2">
      <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {t("controls.magnitude")}
      </div>
      <div className="flex items-center gap-2">
        {MAG_COLOR_STOPS.map(([mag, color], i) => (
          <div key={mag} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-[10px] text-[var(--muted)]">
              {mag}+
            </span>
            {i < MAG_COLOR_STOPS.length - 1 && (
              <span className="mx-0.5 text-[var(--line)]">·</span>
            )}
          </div>
        ))}
      </div>
      <a
        href="https://earthquake.usgs.gov/"
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--copper)]"
      >
        {t("controls.dataSource")}
      </a>
    </div>
  );
}
