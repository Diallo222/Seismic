import type { PropsWithChildren } from "react";
import { HudFrame } from "../hud/HudFrame";

/** @deprecated Use HudFrame from hud/HudFrame */
export function Panel({ children }: PropsWithChildren) {
  return (
    <HudFrame className="flex flex-col gap-4 overflow-y-auto p-4">
      {children}
    </HudFrame>
  );
}
