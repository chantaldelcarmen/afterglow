import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { H2, Body, BodySmall, Subtitle } from "../components/Typography";
import { AppLogo } from "../components/AppLogo";
import supabase from "../utils/supabase";
import { useAuth } from "../utils/AuthContext";

const inputStyle = {
  background: "var(--color-surface-glass-card)",
  borderColor: "var(--color-surface-glass-card-border)",
  color: "var(--color-text-primary)",
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
};

export function SignIn() {
  const navigate = useNavigate();
  const { role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [awaitingRole, setAwaitingRole] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(timer); setMounted(false); };
  }, []);

  // Once sign-in succeeds, wait for AuthContext to resolve the role then redirect
  useEffect(() => {
    if (!awaitingRole || authLoading || !role) return;
    if (role === "admin") navigate("/admin");
    else if (role === "platform_reviewer") navigate("/reviewer");
    else navigate("/");
  }, [awaitingRole, authLoading, role, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // AuthContext's onAuthStateChange will fire and fetch the role;
    // the effect above will redirect once it's available
    setAwaitingRole(true);
  };

  return (
    <div
      className="h-full flex flex-col justify-center space-y-3 overflow-hidden transition-all duration-700"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <form onSubmit={handleSignIn} className="w-full max-w-md mx-auto space-y-4 px-6">
        <AppLogo />
        <H2 className="text-center mb-6">Welcome Back</H2>
        <Subtitle className="text-center">
          A private space to relive your most meaningful moments.
        </Subtitle>

        {error && (
          <p className="text-center text-sm" style={{ color: "var(--color-accent-coral)" }}>
            {error}
          </p>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-2">
            <BodySmall style={{ color: "var(--color-text-muted)" }}>Email</BodySmall>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-[28px] border backdrop-blur-xl px-5 py-4 transition-all duration-300 focus:outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px var(--color-button-warm-glow)";
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border-hover)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border)";
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-2">
            <BodySmall style={{ color: "var(--color-text-muted)" }}>Password</BodySmall>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full rounded-[28px] border backdrop-blur-xl px-5 py-4 transition-all duration-300 focus:outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px var(--color-button-warm-glow)";
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border-hover)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border)";
            }}
          />
        </div>

        {/* Forgot Password Button */}
        <div className="text-right pt-2">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="transition-all duration-300 hover:underline"
            style={{ color: "var(--color-text-primary)", fontSize: "14px" }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border backdrop-blur-md px-5 py-3.5 transition-all duration-300 mt-9 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <Body style={{ color: "var(--color-text-primary)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </Body>
        </button>
        
        {/* Sign Up Link */}
        <div className="text-center pt-4">
          <Body style={{ color: "var(--color-text-muted)" }}>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="transition-all duration-300 hover:underline"
              style={{ color: "var(--color-text-primary)" }}
            >
              Sign up
            </button>
          </Body>
        </div>
      </form>
    </div>
  );
}