import type { FeedWindow, Quake } from "../lib/types";

const FEED_URLS: Record<FeedWindow, string> = {
  hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
  significant_month:
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson",
};

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    tsunami: number;
    felt: number | null;
  };
  geometry: {
    type: "Point";
    // ⚠️ USGS order is [longitude, latitude, depth] — lng first.
    coordinates: [number, number, number];
  };
};

type UsgsFeedResponse = {
  features: UsgsFeature[];
};

function normalize(feature: UsgsFeature): Quake | null {
  const { properties, geometry, id } = feature;
  if (!geometry?.coordinates || properties.mag == null) return null;

  const [lng, lat, depth] = geometry.coordinates;

  return {
    id,
    lat,
    lng,
    depth,
    mag: properties.mag,
    time: properties.time,
    place: properties.place ?? "Unknown location",
    url: properties.url,
    tsunami: properties.tsunami === 1,
    felt: properties.felt,
  };
}

export async function fetchQuakes(feed: FeedWindow): Promise<Quake[]> {
  const res = await fetch(FEED_URLS[feed]);
  if (!res.ok) {
    throw new Error(`USGS feed request failed: ${res.status} ${res.statusText}`);
  }
  const data: UsgsFeedResponse = await res.json();
  return data.features
    .map(normalize)
    .filter((q): q is Quake => q !== null)
    .sort((a, b) => b.time - a.time);
}
