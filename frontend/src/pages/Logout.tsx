import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AppLogo } from "../components/AppLogo";
import { H2, Body, BodySmall } from "../components/Typography";
import supabase from "../utils/supabase";

export function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppLogo />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto px-6 text-center pb-24">
        {/* Logout Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "var(--color-surface-glass-card)",
            border: "1px solid var(--color-surface-glass-card-border)",
            boxShadow: "0 0 24px var(--color-button-warm-glow)",
          }}
        >
          <LogOut size={32} style={{ color: "var(--color-accent-coral)" }} />
        </div>

        <H2 className="text-center mb-4">Sign Out?</H2>
        <Body
          className="text-center mb-8 leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          Are you sure you want to sign out? Your memories will be waiting for you when you return.
        </Body>

        <div className="w-full space-y-3">
          <button
            onClick={handleLogout}
            className="w-full rounded-full border backdrop-blur-md px-5 py-3.5 transition-all duration-300"
            style={{
              background: "var(--color-button-plum-bg)",
              borderColor: "var(--color-button-plum-border)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-button-plum-bg-hover)";
              e.currentTarget.style.borderColor = "var(--color-button-plum-border-hover)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-button-plum-bg)";
              e.currentTarget.style.borderColor = "var(--color-button-plum-border)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)";
            }}
          >
            <Body style={{ color: "var(--color-text-primary)" }}>Yes, Sign Out</Body>
          </button>

          <button
            onClick={handleCancel}
            className="w-full rounded-full border backdrop-blur-md px-5 py-3.5 transition-all duration-300"
            style={{
              background: "var(--color-surface-glass)",
              borderColor: "var(--color-button-warm-border)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 12px rgba(246,237,227,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.25)";
            }}
          >
            <Body style={{ color: "var(--color-text-primary)" }}>Cancel</Body>
          </button>
        </div>

        <BodySmall
          className="text-center mt-8 leading-relaxed"
          style={{ color: "var(--color-text-muted-dim)" }}
        >
          Your memories are always private and secure with us.
        </BodySmall>
      </div>
    </div>
  );
}