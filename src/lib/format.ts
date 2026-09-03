export function timeAgo(epochMs: number): string {
  const diffSec = Math.max(0, (Date.now() - epochMs) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = diffSec / 60;
  if (diffMin < 60) return `${Math.floor(diffMin)}m ago`;
  const diffHr = diffMin / 60;
  if (diffHr < 24) return `${Math.floor(diffHr)}h ago`;
  const diffDay = diffHr / 24;
  return `${Math.floor(diffDay)}d ago`;
}

export function formatMag(mag: number): string {
  return mag.toFixed(1);
}

export function formatDepth(depthKm: number): string {
  return `${depthKm.toFixed(1)} km`;
}
