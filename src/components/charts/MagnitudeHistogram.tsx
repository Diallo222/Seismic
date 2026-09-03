import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { useState } from "react";
import type { Quake } from "../../lib/types";
import { magnitudeHistogram } from "../../lib/chartData";
import { magToColor } from "../../lib/geo";

const MARGIN = { top: 8, right: 8, bottom: 18, left: 8 };

function Chart({
  width,
  height,
  quakes,
}: {
  width: number;
  height: number;
  quakes: Quake[];
}) {
  const [hover, setHover] = useState<{ mag: number; count: number } | null>(
    null,
  );

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
    <svg width={width} height={height} aria-label="Magnitude distribution chart">
      <Group left={MARGIN.left} top={MARGIN.top}>
        <line
          x1={0}
          x2={innerW}
          y1={innerH}
          y2={innerH}
          stroke="rgba(232,196,160,0.14)"
        />
        {bins.map((b) => {
          const barHeight = innerH - (yScale(b.count) ?? innerH);
          const x = xScale(b.mag) ?? 0;
          const active = hover?.mag === b.mag;
          return (
            <g key={b.mag}>
              <Bar
                x={x}
                y={innerH - barHeight}
                width={xScale.bandwidth()}
                height={barHeight}
                fill={magToColor(b.mag)}
                opacity={active ? 1 : 0.85}
                rx={1}
                onMouseEnter={() => setHover(b)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "default" }}
              />
              <text
                x={x + xScale.bandwidth() / 2}
                y={innerH + 12}
                textAnchor="middle"
                fill="rgba(168,152,136,0.8)"
                fontSize={9}
                fontFamily="IBM Plex Mono, monospace"
              >
                {b.mag}
              </text>
            </g>
          );
        })}
        {hover && (
          <text
            x={innerW}
            y={10}
            textAnchor="end"
            fill="var(--copper)"
            fontSize={10}
            fontFamily="IBM Plex Mono, monospace"
          >
            M{hover.mag}+ · {hover.count}
          </text>
        )}
      </Group>
    </svg>
  );
}

export function MagnitudeHistogram({ quakes }: { quakes: Quake[] }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
        Magnitude distribution
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
