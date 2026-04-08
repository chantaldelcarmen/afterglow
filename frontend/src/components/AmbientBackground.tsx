import type { ReactNode } from "react";

export function AmbientBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--color-surface-bg)" }}>

      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Pink - bottom left */}
        <div
          className="absolute bottom-50 -left-10 w-52 h-52 rounded-full blur-[20px] opacity-40"
          style={{ backgroundColor: "var(--color-accent-pink)" }}
        />
        {/* Turquoise - bottom right */}
        <div
          className="absolute bottom-0 -right-20 w-36 h-36 rounded-full blur-[25px] opacity-25"
          style={{ backgroundColor: "var(--color-accent-turquoise)" }}
        />
        {/* Gold - center */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-[45%] -translate-x-1/2 w-48 h-48 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: "var(--color-accent-gold)" }}
        />
        {/* Coral - top left */}
        <div
          className="absolute top-32 left-6 w-32 h-32 rounded-full blur-[20px] opacity-25"
          style={{ backgroundColor: "var(--color-accent-coral)" }}
        />
        {/* Lavender - top right */}
        <div
          className="absolute -top-4 -right-6 w-36 h-36 rounded-full blur-[25px] opacity-25"
          style={{ backgroundColor: "var(--color-accent-lavender)" }}
        />
      </div>

      {/* Bottom warm glow near nav */}
      <div
        className="absolute w-96 h-36 rounded-full pointer-events-none"
        style={{
          left: "50%",
          bottom: "18px",
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse 180px 60px at center, rgba(200, 170, 150, 0.12) 0%, rgba(180, 150, 130, 0.08) 30%, rgba(160, 130, 110, 0.04) 50%, transparent 70%)",
          filter: "blur(25px)",
        }}
      />

      {/* Dark scrim for readability */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.25)", zIndex: 1 }} />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}