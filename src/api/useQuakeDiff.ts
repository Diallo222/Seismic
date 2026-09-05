import { useEffect, useRef } from "react";
import type { FeedWindow, Quake } from "../lib/types";
import { useDashboardStore } from "../store/useDashboardStore";

/**
 * Diffs each poll against the previous one and flags genuinely new quakes
 * (present now, absent last time) in the store. Skips the very first load
 * of a feed — everything is "new" then, and we don't want the globe to
 * ripple-storm on mount or on switching feeds.
 *
 * Also skips placeholder data from keepPreviousData so a feed switch does
 * not baseline against the previous window's ids.
 */
export function useQuakeDiff(
  quakes: Quake[] | undefined,
  feed: FeedWindow,
  isPlaceholderData = false,
) {
  const seenIds = useRef<Set<string> | null>(null);
  const lastFeed = useRef<FeedWindow | null>(null);
  const markNewQuakes = useDashboardStore((s) => s.markNewQuakes);

  useEffect(() => {
    if (feed !== lastFeed.current) {
      // Switched feed window — different id universe, not "new" arrivals.
      seenIds.current = null;
      lastFeed.current = feed;
    }

    if (!quakes || isPlaceholderData) return;

    if (seenIds.current) {
      const previouslySeen = seenIds.current;
      const newlyArrived = quakes
        .filter((q) => !previouslySeen.has(q.id))
        .map((q) => q.id);
      if (newlyArrived.length > 0) markNewQuakes(newlyArrived);
    }

    seenIds.current = new Set(quakes.map((q) => q.id));
  }, [quakes, feed, markNewQuakes, isPlaceholderData]);
}
