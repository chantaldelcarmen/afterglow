import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { H2, Body, BodySmall } from "../components/Typography";
import { BackButton } from "../components/BackButton";
import { AppLogo } from "../components/AppLogo";
import {
  ChevronRight,
  UserCircle2,
  BarChart3,
  Info,
  LogOut,
  Trash2,
} from "lucide-react";

export function Settings() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(timer); setMounted(false); };
  }, []);

  const handleLogOut = () => {
    navigate("/logout");
  };

  const handleDeleteAccount = () => {
    alert("Delete account flow not implemented yet.");
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
    <div className="h-full flex flex-col pb-8 overflow-y-auto">
      <div
        className="sticky top-0 z-20 pt-8 px-6 pb-4 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transitionDelay: "50ms",
        }}
      >
        <AppLogo />
        <BackButton />
      </div>

      <div
        className="px-6 space-y-6 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "100ms",
        }}
      >
        <section className="space-y-4">
          <H2>Settings</H2>

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
        </section>

        <section className="space-y-4 pt-2">
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

        <section className="pt-2">
          <BodySmall
            className="text-center"
            style={{
              color: "var(--color-text-muted-dim)",
              lineHeight: "1.8",
            }}
          >
            Your memories are precious. We're committed to keeping your data
            private and secure.
          </BodySmall>
        </section>
      </div>
    </div>
  );
}
