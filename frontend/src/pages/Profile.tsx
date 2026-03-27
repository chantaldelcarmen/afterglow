import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { H2, Body, BodySmall } from "../components/Typography";
import { AppLogo } from "../components/AppLogo";
import { useAuth } from "../utils/AuthContext";
import { getUserExperiences } from "../lib/experience";
import { getFragments } from "../lib/storage";

export function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [experienceCount, setExperienceCount] = useState<number>(0);
  const [fragmentCount, setFragmentCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    getUserExperiences(user.id)
      .then(async (experiences) => {
        setExperienceCount(experiences.length);
        const counts = await Promise.all(
          experiences.map((exp) => getFragments(exp.id).then((f) => f.length).catch(() => 0))
        );
        setFragmentCount(counts.reduce((sum, n) => sum + n, 0));
      })
      .catch(() => {
        setExperienceCount(0);
        setFragmentCount(0);
      });
  }, [user]);

  if (loading) return null;
  if (!user) {
    navigate("/signin");
    return null;
  }

  const displayName = user.user_metadata?.full_name ?? user.email ?? "User";
  const email = user.email ?? "";

  return (
    <div className="h-full flex flex-col px-6 pb-8 space-y-8 overflow-y-auto">
      <AppLogo />

      {/* Profile section */}
      <section className="space-y-4">
        <H2>Your Profile</H2>

        {/* Avatar + name */}
        <div className="flex flex-col items-center space-y-3 py-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: "var(--color-button-plum-bg)",
              border: "2px solid var(--color-surface-glass-card-border)",
            }}
          >
            <span style={{ color: "var(--color-text-primary)" }}>
              {displayName[0].toUpperCase()}
            </span>
          </div>
          <div className="text-center">
            <Body style={{ color: "var(--color-text-primary)" }}>{displayName}</Body>
            <BodySmall style={{ color: "var(--color-text-muted)" }}>{email}</BodySmall>
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex rounded-2xl overflow-hidden"
          style={{
            background: "var(--color-surface-glass-card)",
            border: "1px solid var(--color-surface-glass-card-border)",
          }}
        >
          <div className="flex-1 flex flex-col items-center py-4 space-y-1">
            <span
              className="text-2xl font-semibold"
              style={{ color: "var(--color-accent-gold)" }}
            >
              {experienceCount}
            </span>
            <BodySmall style={{ color: "var(--color-text-muted)" }}>Experiences</BodySmall>
          </div>
          <div
            className="w-px self-stretch"
            style={{ background: "var(--color-surface-glass-card-border)" }}
          />
          <div className="flex-1 flex flex-col items-center py-4 space-y-1">
            <span
              className="text-2xl font-semibold"
              style={{ color: "var(--color-accent-coral)" }}
            >
              {fragmentCount}
            </span>
            <BodySmall style={{ color: "var(--color-text-muted)" }}>Fragments</BodySmall>
          </div>
        </div>
      </section>

      {/* Settings button */}
      <section className="space-y-3">
        <H2>Settings</H2>
        <button
          onClick={() => navigate("/settings")}
          className="w-full rounded-full border backdrop-blur-md px-5 py-3.5 flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: "var(--color-button-plum-bg)",
            borderColor: "var(--color-button-plum-border)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-button-plum-bg-hover)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-button-plum-bg)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)";
          }}
        >
          <Body style={{ color: "var(--color-text-primary)" }}>Settings</Body>
        </button>
      </section>

      {/* Privacy note */}
      <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
        Your memories are precious. We're committed to keeping your data private and secure.
      </p>
    </div>
  );
}
