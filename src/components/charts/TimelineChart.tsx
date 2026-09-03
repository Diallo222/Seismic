import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { AreaClosed } from "@visx/shape";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import { useTranslation } from "react-i18next";
import type { Quake } from "../../lib/types";
import { hourlyTimeline } from "../../lib/chartData";

const MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };
const ACCENT = "#e0b07a";

function Chart({
  width,
  height,
  quakes,
}: {
  width: number;
  height: number;
  quakes: Quake[];
}) {
  const { t } = useTranslation();
  if (width < 10) return null;

  const buckets = hourlyTimeline(quakes);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const xScale = scaleTime({
    domain: [buckets[0].time, buckets[buckets.length - 1].time],
    range: [0, innerW],
  });
  const yScale = scaleLinear<number>({
    domain: [0, Math.max(1, ...buckets.map((b) => b.count))],
    range: [innerH, 0],
    nice: true,
  });

  const peak = Math.max(...buckets.map((b) => b.count));

  return (
    <svg width={width} height={height} aria-label={t("charts.past24hAria")}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        <LinearGradient
          id="timeline-gradient"
          from={ACCENT}
          to={ACCENT}
          fromOpacity={0.35}
          toOpacity={0}
        />
        <AreaClosed
          data={buckets}
          x={(d) => xScale(d.time) ?? 0}
          y={(d) => yScale(d.count) ?? 0}
          yScale={yScale}
          curve={curveMonotoneX}
          fill="url(#timeline-gradient)"
          stroke={ACCENT}
          strokeWidth={1.5}
        />
        <line
          x1={0}
          x2={innerW}
          y1={innerH}
          y2={innerH}
          stroke="rgba(232,196,160,0.14)"
        />
        <text
          x={innerW}
          y={10}
          textAnchor="end"
          fill="var(--copper)"
          fontSize={10}
          fontFamily="IBM Plex Mono, monospace"
        >
          {t("charts.peakPerHour", { count: peak })}
        </text>
      </Group>
    </svg>
  );
}

export function TimelineChart({ quakes }: { quakes: Quake[] }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
        {t("charts.past24h")}
      </div>
      <div style={{ height: 100 }}>
        <ParentSize>
          {({ width, height }) => (
            <Chart width={width} height={height} quakes={quakes} />
          )}
        </ParentSize>
      </div>
    </div>
  );
}
