import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HudFrame } from "./HudFrame";

export function ErrorToast({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <HudFrame
      strong
      className="pointer-events-auto flex max-w-sm items-start gap-3 p-3"
      role="alert"
    >
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
          {t("states.feedError")}
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--copper)] transition-colors hover:border-[var(--copper)] hover:text-[var(--ink)]"
      >
        <RefreshCw size={12} />
        {t("states.retry")}
      </button>
    </HudFrame>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="pointer-events-none flex flex-col gap-3">
      <div className="flex gap-px">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-20" />
        ))}
      </div>
    </div>
  );
}
