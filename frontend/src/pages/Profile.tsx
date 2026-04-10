import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { H2, Body, BodySmall } from "../components/Typography";
import { AppLogo } from "../components/AppLogo";
import { useAuth } from "../utils/AuthContext";
import { getUserExperiences } from "../lib/experience";
import { getFragments } from "../lib/storage";
import { HelpButton } from "../components/HelpButton";
import { HELP_CONTENT } from "../data/help-content";
import {
  ChevronRight,
  UserCircle2,
  BarChart3,
  Info,
  LogOut,
  Trash2,
  Sparkles,
} from "lucide-react";
import { getSettings, patchSettings } from "../lib/api";
import { AIReflectionConsentModal } from "../components/AIReflectionConsentModal";

export function Profile() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [experienceCount, setExperienceCount] = useState<number>(0);
  const [fragmentCount, setFragmentCount] = useState<number>(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [aiReflectionEnabled, setAiReflectionEnabled] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

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

  const isPrivilegedRole = role === "admin" || role === "platform_reviewer";

  useEffect(() => {
    if (!isPrivilegedRole) {
      loadStats();
    } else {
      setDataLoading(false);
    }
  }, [loadStats, isPrivilegedRole]);

  useEffect(() => {
    getSettings()
      .then((s) => setAiReflectionEnabled(s.ai_reflection_enabled))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin");
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Body style={{ color: "var(--color-text-muted)" }}>Loading...</Body>
      </div>
    );
  }

  const rawName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const displayName = rawName.trim();
  const email = user.email ?? "";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "platform_reviewer"
      ? "Platform Reviewer"
      : null;

  const handleLogOut = () => {
    navigate("/logout");
  };

  const handleDeleteAccount = () => {
    alert("Delete account flow not implemented yet.");
  };

  const handleAiReflectionToggle = async () => {
    if (!aiReflectionEnabled) {
      setShowConsentModal(true);
    } else {
      try {
        await patchSettings({ ai_reflection_enabled: false });
        setAiReflectionEnabled(false);
      } catch {
        // TODO: surface error to user
      }
    }
  };

  const handleConsentConfirm = async () => {
    try {
      await patchSettings({ ai_reflection_enabled: true });
      setAiReflectionEnabled(true);
      setShowConsentModal(false);
    } catch {
      // TODO: surface error to user
    }
  };

  const rowStyle: React.CSSProperties = {
    background: "var(--color-surface-glass-card)",
    borderColor: "var(--color-surface-glass-card-border)",
    boxShadow:
      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
  };

  const primaryButtonStyle: React.CSSProperties = {
    background: "var(--color-button-plum-bg)",
    borderColor: "var(--color-button-plum-border)",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
  };

  return (
    <div className="h-full flex flex-col px-6 pb-36 overflow-y-auto">
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
                {initial}
              </span>
            </div>
            <div className="text-center space-y-1">
              <Body style={{ color: "var(--color-text-primary)" }}>{displayName}</Body>
              <BodySmall style={{ color: "var(--color-text-muted)" }}>{email}</BodySmall>

              {roleLabel && (
                <div className="pt-1">
                  <span
                    className="inline-flex px-3 py-1 rounded-full border text-xs"
                    style={{
                      background: "var(--color-surface-glass-card)",
                      borderColor: "var(--color-surface-glass-card-border)",
                      color: "var(--color-text-muted-dim)",
                    }}
                  >
                    {roleLabel}
                  </span>
                </div>
              )}
            </div>
          </div>

          {!isPrivilegedRole && (
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
          )}
          {!isPrivilegedRole && error && (
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

        {/* Settings section */}
        <section className="space-y-4">
          <H2>Settings</H2>
          {role === "user" && (
            <>
              <button
                onClick={() => navigate("/profile/edit")}
                className="w-full rounded-full border backdrop-blur-xl px-5 py-4 flex items-center justify-between transition-all duration-300"
                style={rowStyle}
              >
                <div className="flex items-center gap-3">
                  <UserCircle2
                    size={22}
                    style={{ color: "var(--color-text-primary)" }}
                  />
                  <Body>Edit Profile</Body>
                </div>
                <ChevronRight
                  size={20}
                  style={{ color: "var(--color-text-muted-dim)", opacity: 0.8 }}
                />
              </button>

              <button
                onClick={() => navigate("/stats")}
                className="w-full rounded-full border backdrop-blur-xl px-5 py-4 flex items-center justify-between transition-all duration-300"
                style={rowStyle}
              >
                <div className="flex items-center gap-3">
                  <BarChart3
                    size={22}
                    style={{ color: "var(--color-text-primary)" }}
                  />
                  <Body>Stats</Body>
                </div>
                <ChevronRight
                  size={20}
                  style={{ color: "var(--color-text-muted-dim)", opacity: 0.8 }}
                />
              </button>

              <button
                onClick={() => navigate("/about")}
                className="w-full rounded-full border backdrop-blur-xl px-5 py-4 flex items-center justify-between transition-all duration-300"
                style={rowStyle}
              >
                <div className="flex items-center gap-3">
                  <Info size={22} style={{ color: "var(--color-text-primary)" }} />
                  <Body>About App</Body>
                </div>
                <ChevronRight
                  size={20}
                  style={{ color: "var(--color-text-muted-dim)", opacity: 0.8 }}
                />
              </button>

              <button
                onClick={handleAiReflectionToggle}
                className="w-full rounded-full border backdrop-blur-xl px-5 py-4 flex items-center justify-between transition-all duration-300"
                style={rowStyle}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={22} style={{ color: "var(--color-text-primary)" }} />
                  <Body>AI Reflection</Body>
                </div>
                <div
                  className="w-11 h-6 rounded-full border transition-all duration-300 flex items-center px-1"
                  style={{
                    background: aiReflectionEnabled
                      ? "var(--color-button-plum-bg)"
                      : "transparent",
                    borderColor: "var(--color-surface-glass-card-border)",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full transition-all duration-300"
                    style={{
                      background: "var(--color-text-primary)",
                      transform: aiReflectionEnabled ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </div>
              </button>
            </>
          )}

          <button
            onClick={handleLogOut}
            className="w-full rounded-full border backdrop-blur-md px-5 py-3.5 flex items-center justify-center gap-2 transition-all duration-300"
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "var(--color-button-plum-bg-hover)";
              e.currentTarget.style.borderColor =
                "var(--color-button-plum-border-hover)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-button-plum-bg)";
              e.currentTarget.style.borderColor =
                "var(--color-button-plum-border)";
              e.currentTarget.style.boxShadow =
                "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)";
            }}
          >
            <LogOut size={20} style={{ color: "var(--color-text-primary)" }} />
            <Body style={{ color: "var(--color-text-primary)" }}>
              Log Out
            </Body>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full rounded-full border backdrop-blur-md px-5 py-3.5 flex items-center justify-center gap-2 transition-all duration-300"
            style={rowStyle}
          >
            <Trash2 size={20} style={{ color: "var(--color-text-primary)" }} />
            <Body>Delete Account</Body>
          </button>
        </section>

        <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
          Your memories are precious. We're committed to keeping your data private and secure.
        </p>
      </div>
      {showConsentModal && (
        <AIReflectionConsentModal
          onConfirm={handleConsentConfirm}
          onCancel={() => setShowConsentModal(false)}
        />
      )}
    </div>
  );
}