import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AppBackground({ children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14001f] text-white">
      {/* base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(120,119,255,0.18),_transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(255,120,180,0.16),_transparent_26%),linear-gradient(180deg,_#14001f_0%,_#1b0326_55%,_#13001d_100%)]" />

      {/* animated orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}