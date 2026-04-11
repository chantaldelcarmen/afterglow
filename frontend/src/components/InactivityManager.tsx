import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { useAuth } from "../utils/AuthContext";
import { useInactivityTimer } from "../hooks/useInactivityTimer";
import { Body, BodySmall } from "./Typography";
import { GlassButton } from "./GlassButton";

// DEMO: set to 10s timeout / 5s warning for demo purposes
// PRODUCTION values: TIMEOUT_MS = 15 * 60 * 1000, WARNING_MS = 60 * 1000
const TIMEOUT_MS = 10 * 1000;
const WARNING_MS = 5 * 1000;

export function InactivityManager() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTimeout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const { showWarning, secondsLeft, resetTimer } = useInactivityTimer({
    timeoutMs: TIMEOUT_MS,
    warningMs: WARNING_MS,
    onTimeout: () => { void handleTimeout(); },
  });

  if (!user || !showWarning) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-[28px] border backdrop-blur-xl p-9 flex flex-col gap-2 items-center"
        style={{
          background: "var(--color-surface-glass-card)",
          borderColor: "var(--color-surface-glass-card-border)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <Body>Still there?</Body>
          <BodySmall>
            You've been inactive for a while. You'll be signed out in{" "}
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{secondsLeft}s</span>.
          </BodySmall>
        </div>
        <div className="flex gap-7 mt-7 w-full">
          <button
            className="flex-1 px-5 py-3.5 rounded-full border backdrop-blur-md transition-all duration-300 text-base"
            style={{
              background: "transparent",
              borderColor: "var(--color-surface-glass-card-border)",
              color: "var(--color-text-muted)",
              fontFamily: "Inter, sans-serif",
            }}
            onClick={() => { void handleTimeout(); }}
          >
            Sign out
          </button>
          <GlassButton className="flex-1" onClick={resetTimer}>Stay logged in</GlassButton>
        </div>
      </div>
    </div>
  );
}
