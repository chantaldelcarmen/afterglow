import { useEffect, useState } from "react";
import { H2, Body, BodySmall } from "../components/Typography";
import { BackButton } from "../components/BackButton";
import { AppLogo } from "../components/AppLogo";
import { GlowOverlay } from "../components/GlowOverlay";
import { mockStats } from "../data/stats-data";
import { Calendar, Image as ImageIcon, Film, FileText } from "lucide-react";

type SmallStatCard = {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
};

export function Stats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(timer); setMounted(false); };
  }, []);

  const smallCards: SmallStatCard[] = [
    {
      id: "experiences-created",
      label: "Experiences\nCreated",
      value: mockStats.experiences,
      icon: <Calendar size={24} strokeWidth={2.2} />,
    },
    {
      id: "photos",
      label: "Photos",
      value: mockStats.photos,
      icon: <ImageIcon size={24} strokeWidth={2.2} />,
    },
    {
      id: "videos",
      label: "Videos",
      value: mockStats.videos,
      icon: <Film size={24} strokeWidth={2.2} />,
    },
    {
      id: "text-fragments",
      label: "Text Fragments",
      value: mockStats.text,
      icon: <FileText size={24} strokeWidth={2.2} />,
    },
  ];

  const baseShadow =
    "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";

  return (
    <div className="h-full flex flex-col pb-32 overflow-y-auto">
      <div
        className="sticky top-0 z-20 pt-8 px-6 pb-4 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transitionDelay: "50ms" }}
      >
        <AppLogo />
        <BackButton />
      </div>

      <div
        className="px-6 space-y-6 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transitionDelay: "100ms" }}
      >
        <section className="space-y-2 pt-1">
          <H2>Your Stats</H2>
        </section>

        {/* Main card */}
        <section>
          <div
            className="relative overflow-hidden rounded-[32px] border backdrop-blur-xl px-6 py-10"
            style={{
              background: "var(--color-surface-glass-card)",
              borderColor: "var(--color-surface-glass-card-border)",
              boxShadow: baseShadow,
            }}
          >
            <GlowOverlay borderRadius="rounded-[32px]" />

            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              <H2
                style={{
                  color: "var(--color-accent-gold, #F0C164)",
                  fontSize: "48px",
                  lineHeight: "1",
                  textShadow:
                    "0 0 18px rgba(240, 193, 100, 0.18), 0 6px 18px rgba(0,0,0,0.28)",
                }}
              >
                {mockStats.totalFragments}
              </H2>

              <Body
                style={{
                  fontSize: "20px",
                  color: "var(--color-text-primary)",
                }}
              >
                Total Fragments
              </Body>

              <BodySmall
                style={{
                  color: "var(--color-text-muted-dim)",
                  fontSize: "14px",
                }}
              >
                Pieces of memories captured
              </BodySmall>
            </div>
          </div>
        </section>

        {/* 2x2 stat cards */}
        <section className="grid grid-cols-2 gap-4">
          {smallCards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-[32px] border backdrop-blur-xl px-4 py-6 min-h-[230px]"
              style={{
                background: "var(--color-surface-glass-card)",
                borderColor: "var(--color-surface-glass-card-border)",
                boxShadow: baseShadow,
              }}
            >
              <GlowOverlay borderRadius="rounded-[32px]" />

              <div className="relative z-10 h-full flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mt-1"
                  style={{
                    background: "rgba(240, 193, 100, 0.08)",
                    boxShadow: "0 0 28px rgba(240, 193, 100, 0.16)",
                    color: "var(--color-accent-gold, #F0C164)",
                  }}
                >
                  {card.icon}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <H2
                    style={{
                      fontSize: "36px",
                      lineHeight: "1",
                      color: "var(--color-text-primary)",
                      textShadow:
                        "0 0 14px rgba(255,255,255,0.08), 0 6px 18px rgba(0,0,0,0.28)",
                    }}
                  >
                    {card.value}
                  </H2>

                  <Body
                    style={{
                      color: "var(--color-text-muted-dim)",
                      fontSize: "16px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {card.label}
                  </Body>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Bottom note */}
        <section className="pb-6">
          <div
            className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl px-6 py-7"
            style={{
              background: "var(--color-surface-glass-card)",
              borderColor: "var(--color-surface-glass-card-border)",
              boxShadow: baseShadow,
            }}
          >
            <GlowOverlay borderRadius="rounded-[28px]" />

            <div className="relative z-10 text-center">
              <Body
                style={{
                  color: "var(--color-text-muted-dim)",
                  lineHeight: "1.8",
                }}
              >
                You've been capturing memories since joining Afterglow. Each fragment helps
                preserve the emotions and stories that matter most.
              </Body>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}