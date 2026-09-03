import i18n from "../i18n";

export function timeAgo(epochMs: number): string {
  const diffSec = Math.max(0, (Date.now() - epochMs) / 1000);
  if (diffSec < 60) return i18n.t("format.justNow");
  const diffMin = diffSec / 60;
  if (diffMin < 60) return i18n.t("format.minutesAgo", { count: Math.floor(diffMin) });
  const diffHr = diffMin / 60;
  if (diffHr < 24) return i18n.t("format.hoursAgo", { count: Math.floor(diffHr) });
  const diffDay = diffHr / 24;
  return i18n.t("format.daysAgo", { count: Math.floor(diffDay) });
}

// Scientific/technical data (magnitude, depth, coordinates) always renders in
// Latin digits, regardless of locale — matches USGS source data and avoids
// mixing numbering systems (e.g. Arabic-Indic) into instrument readouts.
export function formatMag(mag: number): string {
  return new Intl.NumberFormat(i18n.language, {
    numberingSystem: "latn",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(mag);
}

export function formatDepth(depthKm: number): string {
  const value = new Intl.NumberFormat(i18n.language, {
    numberingSystem: "latn",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(depthKm);
  return i18n.t("format.depthKm", { value });
}

export function formatNumber(value: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(i18n.language, { numberingSystem: "latn", ...opts }).format(value);
}
