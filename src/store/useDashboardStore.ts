import { create } from "zustand";
import type { FeedWindow } from "../lib/types";

type Filters = {
  minMag: number;
  maxMag: number;
  tsunamiOnly: boolean;
};

// How long a quake stays flagged "new" after a poll first reveals it —
// long enough to see its ripple burst + stat count-up.
const NEW_QUAKE_PULSE_MS = 4000;

type DashboardState = {
  feed: FeedWindow;
  filters: Filters;
  selectedId: string | null;
  newIds: Set<string>;
  setFeed: (feed: FeedWindow) => void;
  setFilters: (filters: Partial<Filters>) => void;
  select: (id: string | null) => void;
  markNewQuakes: (ids: string[]) => void;
};

export const DEFAULT_FILTERS: Filters = {
  minMag: 0,
  maxMag: 10,
  tsunamiOnly: false,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  feed: "day",
  filters: DEFAULT_FILTERS,
  selectedId: null,
  newIds: new Set(),
  setFeed: (feed) => set({ feed }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  select: (id) => set({ selectedId: id }),
  markNewQuakes: (ids) => {
    if (ids.length === 0) return;

    set((state) => {
      const next = new Set(state.newIds);
      ids.forEach((id) => next.add(id));
      return { newIds: next };
    });

    setTimeout(() => {
      set((state) => {
        const next = new Set(state.newIds);
        ids.forEach((id) => next.delete(id));
        return { newIds: next };
      });
    }, NEW_QUAKE_PULSE_MS);
  },
}));
