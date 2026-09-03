import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { AreaClosed } from "@visx/shape";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import type { Quake } from "../../lib/types";
import { hourlyTimeline } from "../../lib/chartData";

const MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };
const ACCENT = "#38bdf8";

function Chart({
  width,
  height,
  quakes,
}: {
  width: number;
  height: number;
  quakes: Quake[];
}) {
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

  return (
    <svg width={width} height={height}>
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
          stroke="rgba(255,255,255,0.1)"
        />
      </Group>
    </svg>
  );
}

export function TimelineChart({ quakes }: { quakes: Quake[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-xs text-white/50">Past 24h</div>
      <div style={{ height: 110 }}>
        <ParentSize>
          {({ width, height }) => (
            <Chart width={width} height={height} quakes={quakes} />
          )}
        </ParentSize>
      </div>
    </div>
  );
}
