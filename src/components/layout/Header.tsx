export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-white">
          Seismic
        </h1>
        <p className="text-xs text-white/50">Live earthquake activity, worldwide</p>
      </div>
      <a
        href="https://earthquake.usgs.gov/"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-white/40 hover:text-white/70"
      >
        Data: USGS
      </a>
    </header>
  );
}
