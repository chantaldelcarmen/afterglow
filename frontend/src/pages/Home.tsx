import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { H2, Body, BodySmall } from "../components/Typography";
import { LoadingScreen } from "../components/LoadingScreen";
import { AppLogo } from "../components/AppLogo";
import { GlassButton } from "../components/GlassButton";
import { useAuth } from "../utils/AuthContext";
import { apiFetch } from "../lib/api";
import type { Experience } from "../types/experience";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    apiFetch("/experiences")
      .then((res) => res.json())
      .then(async (data: Experience[]) => {
        setExperiences(data);
        const urlEntries = await Promise.all(
          data
            .filter((exp) => exp.anchor_fragment_id)
            .map(async (exp) => {
              try {
                const res = await apiFetch(
                  `/experiences/${exp.id}/fragments/${exp.anchor_fragment_id}/signed-url`
                );
                const { signedUrl } = await res.json();
                return [exp.id, signedUrl] as const;
              } catch {
                return null;
              }
            })
        );
        setSignedUrls(
          Object.fromEntries(urlEntries.filter((e): e is readonly [string, string] => e !== null))
        );
      })
      .catch(() => setError("Failed to load experiences"))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <LoadingScreen />;

  const publishedExperiences = experiences.filter((exp) => !exp.is_draft);

  const handleSurprise = () => {
    if (publishedExperiences.length === 0) return;
    const random = publishedExperiences[Math.floor(Math.random() * publishedExperiences.length)];
    navigate(`/experience/${random.id}`);
  };
  const featured = publishedExperiences[0] ?? null;
  const recent = publishedExperiences.slice(1, 3);

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-20 pb-4 px-6 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transitionDelay: "50ms",
        }}
      >
        <AppLogo />
        <H2>Welcome Back</H2>
        <BodySmall className="mt-1" style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}>
          Your emotional memories, preserved and waiting
        </BodySmall>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto pb-24 md:pb-0 px-6 space-y-6 transition-all duration-700"
        style={{
          opacity: loading ? 0 : 1,
          transform: loading ? "translateY(12px)" : "translateY(0)",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        {error && (
          <p className="text-sm text-center" style={{ color: "var(--color-accent-coral)" }}>{error}</p>
        )}

        {/* Hero Card */}
        {featured ? (
          <div
            className="relative overflow-hidden h-52 md:h-80 rounded-[28px] border backdrop-blur-xl transition-all duration-300 cursor-pointer"
            style={{
              background: "var(--color-surface-glass-card)",
              borderColor: "var(--color-surface-glass-card-border)",
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border-hover)";
              e.currentTarget.style.boxShadow = `inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 30px var(--color-button-warm-glow)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border)";
              e.currentTarget.style.boxShadow = "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
            }}
            onClick={() => navigate(`/experience/${featured.id}`)}
          >
            {signedUrls[featured.id] && (
              <img
                src={signedUrls[featured.id]}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: imageLoaded[featured.id] ? 1 : 0 }}
                onLoad={() => setImageLoaded((prev) => ({ ...prev, [featured.id]: true }))}
              />
            )}

            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }}
            />
            <div
              className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)" }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <BodySmall className="mb-2" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-serif)" }}>
                Continue Reliving
              </BodySmall>
              <h3
                className="text-2xl mb-1"
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-primary)", textShadow: "var(--shadow-text-strong)" }}
              >
                {featured.title}
              </h3>
              {featured.experience_date && (
                <BodySmall className="mb-4" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(featured.experience_date).toLocaleDateString()}
                </BodySmall>
              )}
              <GlassButton
                size="sm"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/experience/${featured.id}`);
                }}
              >
                Relive Now
              </GlassButton>
            </div>
          </div>
        ) : (
          <div
            className="relative overflow-hidden h-52 rounded-[28px] border backdrop-blur-xl flex flex-col items-center justify-center text-center px-6 gap-4"
            style={{
              background: "var(--color-surface-glass-card)",
              borderColor: "var(--color-surface-glass-card-border)",
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
            }}
          >
            <H2 style={{ color: "var(--color-text-muted)" }}>No experiences yet</H2>
            <GlassButton onClick={() => navigate("/create-experience")}>
              Create your first
            </GlassButton>
          </div>
        )}

        {/* Recently Relived */}
        {recent.length > 0 && (
          <div>
            <H2 className="px-1 mb-3">Recently Relived</H2>
            <div className="grid grid-cols-2 gap-4">
              {recent.map((exp) => (
                <div
                  key={exp.id}
                  className="relative overflow-hidden rounded-[20px] border backdrop-blur-xl h-36 cursor-pointer transition-all duration-300"
                  style={{
                    background: "var(--color-surface-glass-card)",
                    borderColor: "var(--color-surface-glass-card-border)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  }}
                  onClick={() => navigate(`/experience/${exp.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border)";
                  }}
                >
                  {signedUrls[exp.id] && (
                    <img
                      src={signedUrls[exp.id]}
                      alt={exp.title}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                      style={{ opacity: imageLoaded[exp.id] ? 1 : 0 }}
                      onLoad={() => setImageLoaded((prev) => ({ ...prev, [exp.id]: true }))}
                    />
                  )}

                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <Body className="font-medium truncate" style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>
                      {exp.title}
                    </Body>
                    {exp.experience_date && (
                      <BodySmall style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>
                        {new Date(exp.experience_date).toLocaleDateString()}
                      </BodySmall>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {publishedExperiences.length > 0 && (
          <GlassButton
            size="md"
            className="w-full"
            onClick={handleSurprise}
            iconLeft={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15 8.5L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9 8.5L12 2Z" />
              </svg>
            }
          >
            Surprise Me
          </GlassButton>
        )}
      </div>
    </div>
  );
}