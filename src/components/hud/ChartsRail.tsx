import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HudFrame } from "../hud/HudFrame";

export function ChartsRail({
  children,
  defaultOpen = true,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <HudFrame className="pointer-events-auto overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-10 w-full cursor-pointer items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        aria-expanded={open}
      >
        <span>Activity</span>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-t border-[var(--line)] p-3 md:grid-cols-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HudFrame>
  );
}
