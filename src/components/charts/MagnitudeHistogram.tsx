import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import type { Quake } from "../../lib/types";
import { magnitudeHistogram } from "../../lib/chartData";
import { magToColor } from "../../lib/geo";

const MARGIN = { top: 8, right: 8, bottom: 8, left: 8 };

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

  const bins = magnitudeHistogram(quakes);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const xScale = scaleBand<number>({
    domain: bins.map((b) => b.mag),
    range: [0, innerW],
    padding: 0.2,
  });
  const yScale = scaleLinear<number>({
    domain: [0, Math.max(1, ...bins.map((b) => b.count))],
    range: [innerH, 0],
  });

  return (
    <svg width={width} height={height}>
      <Group left={MARGIN.left} top={MARGIN.top}>
        <line
          x1={0}
          x2={innerW}
          y1={innerH}
          y2={innerH}
          stroke="rgba(255,255,255,0.1)"
        />
        {bins.map((b) => {
          const barHeight = innerH - (yScale(b.count) ?? innerH);
          const x = xScale(b.mag) ?? 0;
          return (
            <Bar
              key={b.mag}
              x={x}
              y={innerH - barHeight}
              width={xScale.bandwidth()}
              height={barHeight}
              fill={magToColor(b.mag)}
              rx={2}
            />
          );
        })}
      </Group>
    </svg>
  );
}

export function MagnitudeHistogram({ quakes }: { quakes: Quake[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-xs text-white/50">Magnitude distribution</div>
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
