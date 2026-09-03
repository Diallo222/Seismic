import type { PropsWithChildren } from "react";

export function Panel({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto border-l border-white/10 bg-black/20 p-4">
      {children}
    </div>
  );
}
