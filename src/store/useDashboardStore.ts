import { create } from "zustand";
import type { FeedWindow } from "../lib/types";

type Filters = {
  minMag: number;
  maxMag: number;
  tsunamiOnly: boolean;
};

type DashboardState = {
  feed: FeedWindow;
  filters: Filters;
  selectedId: string | null;
  setFeed: (feed: FeedWindow) => void;
  setFilters: (filters: Partial<Filters>) => void;
  select: (id: string | null) => void;
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
  setFeed: (feed) => set({ feed }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  select: (id) => set({ selectedId: id }),
}));
