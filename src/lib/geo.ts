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
// Observatory palette: deep teal → ochre → ember → blood.
export const MAG_COLOR_STOPS: [number, string][] = [
  [0, "#2a6b6b"],
  [4, "#c9a227"],
  [6, "#c45c26"],
  [8, "#9b1d1d"],
];

export function magToColor(mag: number): string {
  for (let i = MAG_COLOR_STOPS.length - 1; i >= 0; i--) {
    if (mag >= MAG_COLOR_STOPS[i][0]) return MAG_COLOR_STOPS[i][1];
  }
  return MAG_COLOR_STOPS[0][1];
}

/**
 * Non-linear size so tiny quakes stay readable and M6+ events read as
 * distinct impacts without blotting the globe.
 */
export function magToSize(mag: number): number {
  const m = Math.max(0, mag);
  // Soft floor + eased curve: ~0.012 at M1, ~0.028 at M4, ~0.048 at M7
  return 0.008 + Math.pow(m / 9, 1.15) * 0.055;
}

/** Shared “selected” accent — copper ink, not pure white. */
export const SELECTED_MARKER_COLOR = "#f4ede4";
export const NEW_MARKER_COLOR = "#e0b07a";
