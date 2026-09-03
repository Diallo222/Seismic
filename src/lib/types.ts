export type Quake = {
  id: string;
  lat: number;
  lng: number;
  depth: number; // km
  mag: number;
  time: number; // epoch ms
  place: string;
  url: string;
  tsunami: boolean;
  felt: number | null;
};

export type FeedWindow = "hour" | "day" | "week" | "significant_month";
