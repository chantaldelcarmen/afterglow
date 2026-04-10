import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { H2, Body, BodySmall } from "../components/Typography";
import { AppLogo } from "../components/AppLogo";
import { useAuth } from "../utils/AuthContext";
import { getUserExperiences } from "../lib/experience";
import { getFragments } from "../lib/storage";
import { HelpButton } from "../components/HelpButton";
import { HELP_CONTENT } from "../data/help-content";

export function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [experienceCount, setExperienceCount] = useState<number>(0);
  const [fragmentCount, setFragmentCount] = useState<number>(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);


  const loadStats = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const experiences = await getUserExperiences();
      setError("");
      setExperienceCount(experiences.length);
      const counts = await Promise.all(
        experiences.map((exp) => getFragments(exp.id).then((f) => f.length).catch(() => 0))
      );
      setFragmentCount(counts.reduce((sum, n) => sum + n, 0));
    } catch {
      setExperienceCount(0);
      setFragmentCount(0);
      setError("Couldn't load your stats. Check your connection.");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return null;
  if (!user) {
    navigate("/signin");
    return null;
  }

  const displayName = user.user_metadata?.full_name ?? user.email ?? "User";
  const email = user.email ?? "";

  return (
    <div className="h-full flex flex-col px-6 pb-8 overflow-y-auto">
      {/* Header */}
      <div
        className="transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transitionDelay: "50ms",
        }}
      >
        <AppLogo />
      </div>

      {/* Content */}
      <div
        className="space-y-8 transition-all duration-700"
        style={{
          opacity: dataLoading ? 0 : 1,
          transform: dataLoading ? "translateY(12px)" : "translateY(0)",
          pointerEvents: dataLoading ? "none" : "auto",
        }}
      >
        {/* Profile section */}
        <section className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <H2>Your Profile</H2>
              <BodySmall className="mt-1" style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}>
                Your account and memory stats
              </BodySmall>
            </div>
            <HelpButton content={HELP_CONTENT["/profile"]} />
          </div>

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

          <div
            className="flex rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-surface-glass-card)",
              border: "1px solid var(--color-surface-glass-card-border)",
            }}
          >
            <div className="flex-1 flex flex-col items-center py-4 space-y-1">
              <span className="text-2xl font-semibold" style={{ color: "var(--color-accent-gold)" }}>
                {experienceCount}
              </span>
              <BodySmall style={{ color: "var(--color-text-muted)" }}>Experiences</BodySmall>
            </div>
            <div className="w-px self-stretch" style={{ background: "var(--color-surface-glass-card-border)" }} />
            <div className="flex-1 flex flex-col items-center py-4 space-y-1">
              <span className="text-2xl font-semibold" style={{ color: "var(--color-accent-coral)" }}>
                {fragmentCount}
              </span>
              <BodySmall style={{ color: "var(--color-text-muted)" }}>Fragments</BodySmall>
            </div>
          </div>
          {error && (
            <div className="text-center space-y-2">
              <p className="text-xs" style={{ color: "var(--color-accent-coral)" }}>
                {error}
              </p>
              <button
                onClick={() => void loadStats()}
                style={{ color: "var(--color-text-muted)", textDecoration: "underline", fontSize: "13px" }}
              >
                Try again
              </button>
            </div>
          )}
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

        <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
          Your memories are precious. We're committed to keeping your data private and secure.
        </p>
      </div>
    </div>
  );
}