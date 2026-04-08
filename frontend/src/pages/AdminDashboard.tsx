import { H2, BodySmall, Body } from "../components/Typography";
import { BackButton } from "../components/BackButton";
import { AppLogo } from "../components/AppLogo";
import { GlassButton } from "../components/GlassButton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const OVERVIEW_CARDS = [
  {
    id: "active-creators",
    label: "Active Creators",
    value: "128",
    detail: "last 30 days",
  },
  {
    id: "items-review",
    label: "Items in review",
    value: "7",
    detail: "pending decisions",
  },
  {
    id: "safety-signals",
    label: "Safety signals",
    value: "2",
    detail: "recent reports related to sharing settings",
  },
  {
    id: "platform-health",
    label: "Platform health",
    value: "All services",
    detail: "operational",
  },
];

const ROLE_CARDS = [
  {
    id: "creator",
    title: "Experience Creator",
    description:
      "Can create private experiences, add fragments, and write reflections. Content is private by default and never public.",
    actionLabel: null,
  },
  {
    id: "reviewer",
    title: "Platform Reviewer",
    description:
      "Reviews metadata only. Never sees raw photos or videos. Approves or escalates items that affect safety, sharing, or platform policy.",
    actionLabel: "Open review queue",
  },
  {
    id: "admin",
    title: "Admin",
    description:
      "Manages roles, high level safety settings, and platform wide controls. Does not override private content by default.",
    actionLabel: null,
  },
];

const RECENT_ACTIVITY = [
  "Assigned reviewer access to 3 team members",
  "Updated sharing defaults for new experiences",
  "Reviewed 2 safety reports from the last week",
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLoading(false);
    setMounted(true);
  }, []);

  const glassCardStyle: React.CSSProperties = {
    background: "var(--color-surface-glass-card)",
    borderColor: "var(--color-surface-glass-card-border)",
    boxShadow:
      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
  };

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Body style={{ color: "var(--color-text-muted)" }}>Loading...</Body>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="sticky top-0 z-20 pb-4 px-6 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transitionDelay: "50ms",
        }}
      >
        <AppLogo />
        <BackButton />
        <div className="flex items-center justify-between">
          <H2>Admin Dashboard</H2>
          <button
            className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer"
            style={{
              borderColor: "var(--color-button-warm-border)",
              color: "var(--color-text-muted)",
              boxShadow: "0 0 10px var(--color-button-warm-glow)",
            }}
          >
            Admin tools
          </button>
        </div>
        <BodySmall
          className="mt-1"
          style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}
        >
          Internal controls for roles, safety, and platform health
        </BodySmall>
      </div>

      <div
        className="flex-1 overflow-y-auto pb-40 md:pb-0 px-6 space-y-5 transition-all duration-700"
        style={{
          opacity: loading ? 0 : 1,
          transform: loading ? "translateY(12px)" : "translateY(0)",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <section className="space-y-4">
          <H2>System Overview</H2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OVERVIEW_CARDS.map((card) => (
              <div
                key={card.id}
                className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl p-6 md:p-8 min-h-[132px] md:min-h-[148px] transition-all duration-300"
                style={glassCardStyle}
              >
                <div
                  className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)",
                  }}
                />

                <div className="relative z-10 flex flex-col gap-3">
                  <BodySmall
                    style={{
                      color: "var(--color-text-muted-dim)",
                      fontSize: "13px",
                    }}
                  >
                    {card.label}
                  </BodySmall>

                  <div className="flex flex-col gap-1">
                    <Body
                      style={{
                        fontSize: "28px",
                        lineHeight: "1.1",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {card.value}
                    </Body>
                    <BodySmall
                      style={{
                        color: "var(--color-text-muted-dim)",
                        fontSize: "13px",
                      }}
                    >
                      {card.detail}
                    </BodySmall>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <H2>Roles and access</H2>

          <div className="space-y-4">
            {ROLE_CARDS.map((role) => (
              <div
                key={role.id}
                className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl p-6 md:p-8 transition-all duration-300"
                style={glassCardStyle}
              >
                <div
                  className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)",
                  }}
                />

                <div className="relative z-10 flex flex-col gap-3">
                  <Body
                    style={{
                      fontSize: "22px",
                      lineHeight: "1.2",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {role.title}
                  </Body>

                  <BodySmall
                    style={{
                      color: "var(--color-text-muted-dim)",
                      fontSize: "13px",
                      lineHeight: "1.7",
                    }}
                  >
                    {role.description}
                  </BodySmall>

                  {role.actionLabel && (
                    <div className="pt-2">
                      <GlassButton size="sm" onClick={() => navigate("/reviewer")}>
                        {role.actionLabel}
                      </GlassButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <H2>Recent admin activity</H2>

          <div
            className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl p-6 md:p-8 transition-all duration-300"
            style={glassCardStyle}
          >
            <div
              className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)",
              }}
            />

            <div className="relative z-10">
              <ul className="space-y-4">
                {RECENT_ACTIVITY.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "var(--color-text-muted-dim)" }}
                    />
                    <BodySmall
                      style={{
                        color: "var(--color-text-muted-dim)",
                        fontSize: "13px",
                        lineHeight: "1.7",
                      }}
                    >
                      {item}
                    </BodySmall>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}