import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../../i18n";

export function LangSwitcher() {
  const { t, i18n } = useTranslation();
  const active = (i18n.resolvedLanguage ?? i18n.language).split("-")[0];

  return (
    <div
      className="pointer-events-auto flex gap-0.5 hud-glass p-1"
      role="group"
      aria-label={t("lang.label")}
    >
      {SUPPORTED_LANGUAGES.map((lng) => {
        const selected = active === lng.code;
        return (
          <button
            key={lng.code}
            type="button"
            onClick={() => void i18n.changeLanguage(lng.code)}
            aria-pressed={selected}
            title={lng.label}
            className={`min-h-11 min-w-11 cursor-pointer rounded-[var(--radius-sm)] px-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-200 ${
              selected
                ? "bg-[var(--accent)] text-[var(--ink)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {lng.short}
          </button>
        );
      })}
    </div>
  );
}
