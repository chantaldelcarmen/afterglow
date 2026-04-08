import { Heart, Shield, Sparkles } from "lucide-react";
import { H2, Body, BodySmall } from "../components/Typography";
import { BackButton } from "../components/BackButton";
import { AppLogo } from "../components/AppLogo";
import { GlowOverlay } from "../components/GlowOverlay";

export function AboutApp() {
  const baseShadow =
    "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";

  const features = [
    {
      icon: <Heart size={20} />,
      title: "Emotional Memory Capture",
      description:
        "Save memories with the emotions you felt, creating a richer, more meaningful archive of your life.",
    },
    {
      icon: <Sparkles size={20} />,
      title: "Relive Your Moments",
      description:
        "Experience your memories again through immersive sequences that bring back the feelings and atmosphere of that moment.",
    },
    {
      icon: <Shield size={20} />,
      title: "Private & Secure",
      description:
        "Your memories belong to you. All content is private by default and designed with privacy in mind.",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-20 pt-8 px-6 pb-4">
        <AppLogo />
        <BackButton />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-0 space-y-6">
        <section className="space-y-2">
          <H2>About Afterglow</H2>
        </section>

        {/* Mission card */}
        <section>
          <div
            className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl p-6"
            style={{
              background: "var(--color-surface-glass-card)",
              borderColor: "var(--color-surface-glass-card-border)",
              boxShadow: baseShadow,
            }}
          >
            <GlowOverlay borderRadius="rounded-[28px]" />

            <div className="relative z-10">
              <Body
                className="text-center leading-relaxed"
                style={{ color: "var(--color-text-primary)" }}
              >
                Afterglow helps you capture and relive the emotional essence of your
                most meaningful memories through fragments — photos, videos, text,
                and reflections that preserve the feeling, not just the facts.
              </Body>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative overflow-hidden rounded-[24px] border backdrop-blur-xl p-5"
              style={{
                background: "var(--color-surface-glass-card)",
                borderColor: "var(--color-surface-glass-card-border)",
                boxShadow: baseShadow,
              }}
            >
              <GlowOverlay borderRadius="rounded-[24px]" />

              <div className="relative z-10 flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    boxShadow: "0 0 12px rgba(240, 193, 100, 0.25)",
                    color: "var(--color-accent-gold, #F0C164)",
                  }}
                >
                  {feature.icon}
                </div>

                <div>
                  <Body
                    style={{
                      color: "var(--color-text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {feature.title}
                  </Body>

                  <BodySmall
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "12px",
                      lineHeight: "1.5",
                    }}
                  >
                    {feature.description}
                  </BodySmall>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <section className="text-center space-y-2 pt-2 pb-6">
          <BodySmall
            style={{
              color: "var(--color-text-muted-dim)",
              fontSize: "11px",
            }}
          >
            © 2026 Afterglow
          </BodySmall>
          <BodySmall
            style={{
              color: "var(--color-text-muted-dim)",
              fontSize: "11px",
            }}
          >
            Made with care for preserving what matters most
          </BodySmall>
        </section>
      </div>
    </div>
  );
}