import { useMemo } from "react";
import { useQuakes } from "./api/useQuakes";
import { useQuakeDiff } from "./api/useQuakeDiff";
import { useDashboardStore } from "./store/useDashboardStore";
import { Header } from "./components/layout/Header";
import { Panel } from "./components/layout/Panel";
import { StatCards } from "./components/dashboard/StatCards";
import { FeedList } from "./components/dashboard/FeedList";
import { Filters } from "./components/dashboard/Filters";
import { QuakeDetail } from "./components/dashboard/QuakeDetail";
import { Globe } from "./components/globe/Globe";
import { MagnitudeHistogram } from "./components/charts/MagnitudeHistogram";
import { TimelineChart } from "./components/charts/TimelineChart";

function App() {
  const feed = useDashboardStore((s) => s.feed);
  const filters = useDashboardStore((s) => s.filters);
  const selectedId = useDashboardStore((s) => s.selectedId);
  const { data: quakes, isLoading, isError, error } = useQuakes(feed);
  useQuakeDiff(quakes, feed);

  const filtered = useMemo(() => {
    if (!quakes) return [];
    return quakes.filter(
      (q) =>
        q.mag >= filters.minMag &&
        q.mag <= filters.maxMag &&
        (!filters.tsunamiOnly || q.tsunami)
    );
  }, [quakes, filters]);

  const selectedQuake = filtered.find((q) => q.id === selectedId) ?? null;

  return (
    <div className="grid h-screen grid-rows-[auto_1fr] bg-neutral-950 text-white">
      <Header />
      <div className="grid grid-cols-1 overflow-hidden md:grid-cols-[1fr_380px]">
        <main className="relative">
          <Globe quakes={filtered} />
          <QuakeDetail quake={selectedQuake} />
        </main>
        <Panel>
          <Filters />
          {isLoading && (
            <div className="text-sm text-white/50">Loading quakes…</div>
          )}
          {isError && (
            <div className="text-sm text-red-400">
              Failed to load: {(error as Error)?.message ?? "unknown error"}
            </div>
          )}
          {!isLoading && !isError && (
            <>
              <StatCards quakes={filtered} />
              <TimelineChart quakes={filtered} />
              <MagnitudeHistogram quakes={filtered} />
              <FeedList quakes={filtered} />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default App;
