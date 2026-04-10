import { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { Camera } from "lucide-react";
import { H2, BodySmall } from "../components/Typography";
import { BackButton } from "../components/BackButton";
import { AppLogo } from "../components/AppLogo";
import { GlowOverlay } from "../components/GlowOverlay";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

export function EditProfile() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(""); 

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(timer); setMounted(false); };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setEmail(user.email ?? "");
      setBio("");

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (!error) {
        setName(data?.display_name ?? user.email?.split("@")[0] ?? "");
      } else {
        setName(user.email?.split("@")[0] ?? "");
      }
    };

    void loadProfile();
  }, [user]);


  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", user.id);

    if (!error) {
      navigate(-1);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--color-surface-glass-card)",
    borderColor: "var(--color-surface-glass-card-border)",
    boxShadow:
      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--color-surface-glass-card)",
    borderColor: "var(--color-surface-glass-card-border)",
    color: "var(--color-text-primary)",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    boxShadow:
      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
    outline: "none",
  };

  const primaryButtonStyle: React.CSSProperties = {
    background: "var(--color-button-plum-bg)",
    borderColor: "var(--color-button-plum-border)",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
  };

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <BodySmall style={{ color: "var(--color-text-muted)" }}>
          Loading...
        </BodySmall>
      </div>
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="h-full flex flex-col">
      <div
        className="sticky top-0 z-20 pt-8 px-6 pb-4 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-12px)", transitionDelay: "50ms" }}
      >
        <AppLogo />
        <BackButton />
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 pb-24 md:pb-0 space-y-6 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transitionDelay: "100ms" }}
      >
        <section className="space-y-2">
          <H2>Edit Profile</H2>
        </section>

        {/* Profile photo */}
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden border-2"
              style={{
                borderColor: "var(--color-button-warm-border)",
                boxShadow:
                  "0 0 24px var(--color-button-warm-glow), 0 0 40px var(--color-button-warm-glow), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{
                  background: "var(--color-button-plum-bg)",
                  color: "var(--color-text-primary)",
                }}
              >
                {initial}
              </div>
            </div>

            <button
              type="button"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: "var(--color-surface-glass-card)",
                borderColor: "var(--color-button-warm-border)",
                border: "1px solid",
                boxShadow: "0 0 12px var(--color-button-warm-glow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 20px var(--color-button-warm-glow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 12px var(--color-button-warm-glow)";
              }}
            >
              <Camera
                size={18}
                style={{ color: "var(--color-text-primary)" }}
              />
            </button>
          </div>

          <BodySmall
            className="mt-3"
            style={{ color: "var(--color-text-muted)", fontSize: "12px" }}
          >
            Tap to change photo
          </BodySmall>
        </section>

        {/* Form card */}
        <section>
          <div
            className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl p-5"
            style={cardStyle}
          >
            <GlowOverlay borderRadius="rounded-[28px]" />

            <div className="relative z-10 space-y-4">
              <div>
                <BodySmall
                  className="mb-2 px-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Name
                </BodySmall>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3 rounded-[20px] border backdrop-blur-xl transition-all duration-300"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-button-warm-border)";
                    e.currentTarget.style.boxShadow =
                      "0 0 16px var(--color-button-warm-glow)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-surface-glass-card-border)";
                    e.currentTarget.style.boxShadow =
                      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
                  }}
                />
              </div>

              <div>
                <BodySmall
                  className="mb-2 px-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Email
                </BodySmall>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-[20px] border backdrop-blur-xl transition-all duration-300"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-button-warm-border)";
                    e.currentTarget.style.boxShadow =
                      "0 0 16px var(--color-button-warm-glow)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-surface-glass-card-border)";
                    e.currentTarget.style.boxShadow =
                      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
                  }}
                />
              </div>

              <div>
                <BodySmall
                  className="mb-2 px-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Bio
                </BodySmall>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-5 py-3 rounded-[20px] border backdrop-blur-xl transition-all duration-300 resize-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-button-warm-border)";
                    e.currentTarget.style.boxShadow =
                      "0 0 16px var(--color-button-warm-glow)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-surface-glass-card-border)";
                    e.currentTarget.style.boxShadow =
                      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <section className="flex gap-3 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 rounded-full border backdrop-blur-xl transition-all duration-300"
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor =
                "var(--color-button-warm-border)";
              e.currentTarget.style.boxShadow =
                "0 0 20px var(--color-button-warm-glow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor =
                "var(--color-surface-glass-card-border)";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
            }}
          >
            <BodySmall style={{ color: "var(--color-text-primary)" }}>
              Cancel
            </BodySmall>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-full border backdrop-blur-xl transition-all duration-300"
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
            <BodySmall style={{ color: "var(--color-text-primary)" }}>
              Save Changes
            </BodySmall>
          </button>
        </section>
      </div>
    </div>
  );
}