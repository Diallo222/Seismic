import { useQuery } from "@tanstack/react-query";
import { fetchQuakes } from "./usgs";
import type { FeedWindow } from "../lib/types";

const POLL_INTERVAL_MS = 60_000; // USGS updates ~every minute; never poll tighter.

export function useQuakes(feed: FeedWindow) {
  return useQuery({
    queryKey: ["quakes", feed],
    queryFn: () => fetchQuakes(feed),
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  });
}
