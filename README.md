# Seismic

Live 3D earthquake dashboard: USGS GeoJSON on a custom globe, with filters, charts, and fly-to selection.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

Import the GitHub repo. Framework: **Vite**. Build: `npm run build`. Output: `dist`.

After the first deploy, if the URL is not `https://seismic.diallo.digital`, update these files to match:

- `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD)
- `public/robots.txt`
- `public/sitemap.xml`

No API keys. Data is fetched in the browser from USGS.

**Data credit:** U.S. Geological Survey Earthquake Hazards Program.
