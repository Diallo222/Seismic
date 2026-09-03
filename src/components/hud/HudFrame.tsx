import type { HTMLAttributes, PropsWithChildren } from "react";

type HudFrameProps = PropsWithChildren<
  {
    className?: string;
    strong?: boolean;
  } & HTMLAttributes<HTMLDivElement>
>;

export function HudFrame({
  children,
  className = "",
  strong = false,
  ...rest
}: HudFrameProps) {
  return (
    <div
      className={`${strong ? "hud-glass-strong" : "hud-glass"} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
