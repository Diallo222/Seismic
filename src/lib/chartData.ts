import type { Quake } from "./types";

export type HistogramBin = { mag: number; count: number };

/** Bucket quakes into fixed-width magnitude bins, e.g. [0,1), [1,2), … */
export function magnitudeHistogram(
  quakes: Quake[],
  binSize = 1,
  maxMag = 9
): HistogramBin[] {
  const bins: HistogramBin[] = [];
  for (let m = 0; m < maxMag; m += binSize) bins.push({ mag: m, count: 0 });

  for (const q of quakes) {
    const idx = Math.min(bins.length - 1, Math.max(0, Math.floor(q.mag / binSize)));
    bins[idx].count += 1;
  }
  return bins;
}

export type TimelineBucket = { time: number; count: number };

/** Bucket quakes into hourly counts over the trailing `hours` window. */
export function hourlyTimeline(quakes: Quake[], hours = 24): TimelineBucket[] {
  const bucketMs = 60 * 60 * 1000;
  const now = Date.now();
  const start = now - hours * bucketMs;

  const buckets: TimelineBucket[] = Array.from({ length: hours }, (_, i) => ({
    time: start + i * bucketMs,
    count: 0,
  }));

  for (const q of quakes) {
    if (q.time < start) continue;
    const idx = Math.min(hours - 1, Math.floor((q.time - start) / bucketMs));
    if (idx >= 0) buckets[idx].count += 1;
  }
  return buckets;
}
