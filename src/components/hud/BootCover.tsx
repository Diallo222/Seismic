import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BOOT_KEY = "seismic-boot-seen";
const BOOT_MS = 1200;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BootCover() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (prefersReducedMotion()) return false;
    return sessionStorage.getItem(BOOT_KEY) !== "1";
  });

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
            Seismic
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]"
          >
            Observing Earth
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.15, duration: 0.9, ease: "easeOut" }}
            className="mt-8 h-px w-32 origin-left bg-[var(--copper)]"
          />
          <p className="mt-6 font-mono text-[10px] text-[var(--muted)]/60">
            Click or press any key to skip
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
