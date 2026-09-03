import { create } from "zustand";

/** Screen-space projection of the selected epicenter — updated from inside the Canvas. */
type EpicenterScreenState = {
  x: number;
  y: number;
  visible: boolean;
  setScreen: (next: { x: number; y: number; visible: boolean }) => void;
  hide: () => void;
};

export const useEpicenterScreen = create<EpicenterScreenState>((set) => ({
  x: 0,
  y: 0,
  visible: false,
  setScreen: (next) =>
    set((prev) =>
      Math.abs(prev.x - next.x) < 0.5 &&
      Math.abs(prev.y - next.y) < 0.5 &&
      prev.visible === next.visible
        ? prev
        : next,
    ),
  hide: () =>
    set((prev) => (prev.visible ? { ...prev, visible: false } : prev)),
}));
