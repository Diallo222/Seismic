import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useQuakes } from "./api/useQuakes";
import { useQuakeDiff } from "./api/useQuakeDiff";
import { useDashboardStore } from "./store/useDashboardStore";
import { Globe } from "./components/globe/Globe";
import { QuakeDetail } from "./components/dashboard/QuakeDetail";
import { StatCards } from "./components/dashboard/StatCards";
import { MagnitudeHistogram } from "./components/charts/MagnitudeHistogram";
import { TimelineChart } from "./components/charts/TimelineChart";
import { GrainVignette } from "./components/hud/GrainVignette";
import { BootCover } from "./components/hud/BootCover";
import { Wordmark } from "./components/hud/Wordmark";
import { LangSwitcher } from "./components/hud/LangSwitcher";
import { FeedPills, MagLegend } from "./components/hud/Controls";
import { RightRail } from "./components/hud/RightRail";
import { ChartsRail } from "./components/hud/ChartsRail";
import { MobileSheet } from "./components/hud/MobileSheet";
import { ErrorToast, LoadingSkeleton } from "./components/hud/States";
import { EpicenterLabel } from "./components/hud/EpicenterLabel";

function useIsXl() {
  const [isXl, setIsXl] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1280px)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    const onChange = () => setIsXl(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isXl;
}

function App() {
  const { t } = useTranslation();
  const feed = useDashboardStore((s) => s.feed);
  const filters = useDashboardStore((s) => s.filters);
  const selectedId = useDashboardStore((s) => s.selectedId);
  const queryClient = useQueryClient();
  const isXl = useIsXl();
  const { data: quakes, isLoading, isError, error, refetch } = useQuakes(feed);
  useQuakeDiff(quakes, feed);

  const filtered = useMemo(() => {
    if (!quakes) return [];
    return quakes.filter(
      (q) =>
        q.mag >= filters.minMag &&
        q.mag <= filters.maxMag &&
        (!filters.tsunamiOnly || q.tsunami),
    );
  }, [quakes, filters]);

  const selectedQuake = filtered.find((q) => q.id === selectedId) ?? null;

  const retry = () => {
    void refetch();
    void queryClient.invalidateQueries({ queryKey: ["quakes", feed] });
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[var(--void)] text-[var(--ink)]">
      <a
        href="#hud-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:bg-[var(--void)] focus:px-3 focus:py-2 focus:text-sm"
      >
        {t("app.skipToTelemetry")}
      </a>

      <Globe quakes={filtered} />
      <GrainVignette />
      <EpicenterLabel quake={selectedQuake} />

      {/* Desktop HUD */}
      <div
        id="hud-main"
        className="pointer-events-none absolute inset-0 z-[10] hidden md:block"
      >
        <div className="absolute start-5 top-5 flex flex-col gap-3">
          <Wordmark />
          <LangSwitcher />
        </div>

        <div className="absolute end-5 top-5">
          <FeedPills />
        </div>

        <RightRail quakes={filtered} loading={isLoading} />

        <div className="absolute bottom-5 start-5 flex max-w-sm flex-col gap-3">
          {isError && (
            <ErrorToast
              message={(error as Error)?.message ?? t("app.feedError")}
              onRetry={retry}
            />
          )}
          {selectedQuake && <QuakeDetail quake={selectedQuake} />}
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            !isError && <StatCards quakes={filtered} />
          )}
        </div>

        <div className="absolute bottom-5 start-1/2 hidden w-[min(480px,36vw)] -translate-x-1/2 xl:block">
          {!isLoading && !isError && (
            <ChartsRail defaultOpen={isXl}>
              <TimelineChart quakes={filtered} />
              <MagnitudeHistogram quakes={filtered} />
            </ChartsRail>
          )}
        </div>

        <div className="absolute bottom-5 end-5 flex w-[min(100%,320px)] flex-col gap-2">
          {!isLoading && !isError && (
            <div className="xl:hidden">
              <ChartsRail defaultOpen={false}>
                <TimelineChart quakes={filtered} />
                <MagnitudeHistogram quakes={filtered} />
              </ChartsRail>
            </div>
          )}
          <MagLegend />
        </div>
      </div>

      {/* Mobile HUD */}
      <div className="pointer-events-none absolute inset-0 z-10 md:hidden">
        <div className="absolute inset-x-3 top-3 flex flex-col gap-2">
          <Wordmark />
          <div className="flex items-center justify-between gap-2">
            <LangSwitcher />
            <FeedPills />
          </div>
        </div>

        {isError && (
          <div className="pointer-events-auto absolute inset-x-3 top-28">
            <ErrorToast
              message={(error as Error)?.message ?? t("app.feedError")}
              onRetry={retry}
            />
          </div>
        )}

        <MobileSheet quakes={filtered} selectedQuake={selectedQuake} />
      </div>

      <BootCover />
    </div>
  );
}

export default App;
