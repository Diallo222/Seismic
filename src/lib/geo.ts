/** Convert lat/lng (degrees) to a position on a sphere of given radius. */
export function latLngToVec3(
  lat: number,
  lng: number,
  radius = 1
): readonly [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ] as const;
}

// Shared magnitude → visual scale, used by globe shaders and charts alike.
const MAG_COLOR_STOPS: [number, string][] = [
  [0, "#38bdf8"], // calm blue
  [4, "#facc15"], // caution yellow
  [6, "#f97316"], // warning orange
  [8, "#ef4444"], // severe red
];

export function magToColor(mag: number): string {
  for (let i = MAG_COLOR_STOPS.length - 1; i >= 0; i--) {
    if (mag >= MAG_COLOR_STOPS[i][0]) return MAG_COLOR_STOPS[i][1];
  }
  return MAG_COLOR_STOPS[0][1];
}

export function magToSize(mag: number): number {
  return Math.max(0.01, mag) * 0.006;
}
