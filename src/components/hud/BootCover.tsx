import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion";

const BOOT_KEY = "seismic-boot-seen";
const BOOT_MS = 1200;

export function BootCover() {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return sessionStorage.getItem(BOOT_KEY) !== "1";
  });

  useEffect(() => {
    if (prefersReducedMotion && visible) {
      sessionStorage.setItem(BOOT_KEY, "1");
      setVisible(false);
    }
  }, [prefersReducedMotion, visible]);

  useEffect(() => {
    if (!visible) return;

    const finish = () => {
      sessionStorage.setItem(BOOT_KEY, "1");
      setVisible(false);
    };

    const timer = window.setTimeout(finish, BOOT_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[50] flex cursor-pointer flex-col items-center justify-center bg-[var(--void)]"
          onClick={() => {
            sessionStorage.setItem(BOOT_KEY, "1");
            setVisible(false);
          }}
          role="presentation"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="font-display text-4xl tracking-tight text-[var(--ink)] md:text-5xl"
          >
            {t("boot.title")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]"
          >
            {t("boot.subtitle")}
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
            className="mt-8 h-px w-32 origin-center bg-[var(--copper)]"
          />
          <p className="mt-6 font-mono text-[10px] text-[var(--muted)]/60">
            {t("boot.skipHint")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
