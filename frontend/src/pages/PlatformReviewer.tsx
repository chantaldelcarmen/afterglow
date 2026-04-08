import { H2, BodySmall, Body } from "../components/Typography";
import { BackButton } from "../components/BackButton";
import { useEffect, useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { useAuth } from "../utils/AuthContext";
import { GlassButton } from "../components/GlassButton";

const MOCK_FLAGGED = [
  {
    id: "1702-8402-1023",
    user_id: "alex",
    submitted_at: "2026-04-05",
    status: "Pending",
    emotion_tags: ["joy", "nostalgia"],
  },
  {
    id: "4444-1256-2300",
    user_id: "sam",
    submitted_at: "2026-04-03",
    status: "Pending",
    emotion_tags: ["calm", "comfort"],
  },
  {
    id: "2345-5421-8988",
    user_id: "jordan",
    submitted_at: "2025-12-07",
    status: "Escalated",
    emotion_tags: ["excitement", "anxiety", "pride", "joy"],
  },
];

export function PlatformReviewer() {
  const [loading, setLoading] = useState(true);
  const [error] = useState("");
  const [mounted, setMounted] = useState(false);
  const { loading: authLoading } = useAuth();
  const [flaggedContent, setFlaggedContent] = useState<typeof MOCK_FLAGGED>([]);
  const [selectedExp, setSelectedExp] = useState<typeof MOCK_FLAGGED[0] | null>(null);

  useEffect(() => {
    const sorted = [...MOCK_FLAGGED].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );
    setFlaggedContent(sorted);
    setLoading(false);
    setMounted(true);
  }, []);


  const handleApprove = (id: any) => {
    setFlaggedContent((prev) => prev.map((e) => e.id === id ? { ...e, status: "Approved" } : e));
  };

  const handleEscalate = (id: any) => {
    setFlaggedContent((prev) => prev.map((e) => e.id === id ? { ...e, status: "Escalated" } : e));
  };

  const handleReset = () => {
    setFlaggedContent([...MOCK_FLAGGED]);
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
        <BackButton></BackButton>
        <div className="flex items-center justify-between">
          <H2>Reviewer Dashboard</H2>
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer"
            style={{ borderColor: "var(--color-button-warm-border)", color: "var(--color-text-muted)", boxShadow: "0 0 10px var(--color-button-warm-glow)" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 18px var(--color-button-warm-glow)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 10px var(--color-button-warm-glow)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
          >
            Reset demo
          </button>
        </div>
        <BodySmall className="mt-1" style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
          Review submitted user experiences
        </BodySmall>
      </div>

      {/**Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto pb-24 md:pb-0 px-6 space-y-6 transition-all duration-700"
        style={{
          opacity: loading ? 0 : 1,
          transform: loading ? "translateY(12px)" : "translateY(0)",
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <H2>Items in review</H2>
        {error && (
          <p className="text-sm text-center" style={{ color: "var(--color-accent-coral)" }}>{error}</p>
        )}

        {flaggedContent.length > 0 ? (
          <div className="space-y-4"> 
            {flaggedContent.map((experience) => (
              <div 
                key={experience.id}
                className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl p-8 transition-all duration-300"
                style={{
                  background: "var(--color-surface-glass-card)", 
                  borderColor: "var(--color-surface-glass-card-border)",
                  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1) 0 8px 24px rgba(0, 0, 0, 0.3)",
                }}
              > 
                <div
                  className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)"
                  }}
                />

                {/**Card Content */}
                <div className="relative z-10 flex flex-col gap-2">
                  {/* Row: ref + status */}
                  <div className="flex items-center justify-between">
                    <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                      Ref #{experience.id.slice(0, 8)}
                    </BodySmall>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                        style={{ background: experience.status === "Pending" ? "#a78bfa" : experience.status === "Approved" ? "#34d399" : "#f87171" }}
                      />
                      <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                        {experience.status}
                      </BodySmall>
                    </div>
                  </div>
                  {/* Row: owner + submitted */}
                  <div className="flex items-center justify-between">
                    <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                      Owner: @{experience.user_id}
                    </BodySmall>
                    <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                      Submitted {experience.submitted_at}
                    </BodySmall>
                  </div>
                  {/* Emotion tags */}
                  <div className="flex gap-2 flex-wrap mt-2">
                    {(experience.emotion_tags ?? []).map((tag) => (
                      <div
                        key={tag}
                        className="px-3 py-1 rounded-full border text-xs"
                        style={{
                          background: "var(--color-surface-glass-card)",
                          borderColor: "var(--color-surface-glass-card-border)",
                        }}
                      >
                        <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                          {tag}
                        </BodySmall>
                      </div>
                    ))}
                  </div>
                  {/* Buttons */}
                  <div className="flex gap-6 mt-4">
                    <GlassButton className="flex-1" onClick={() => setSelectedExp(experience)}>
                      View metadata
                    </GlassButton>
                    <GlassButton className="flex-1" onClick={() => handleApprove(experience.id)}>
                      Approve
                    </GlassButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="relative overflow-hidden h-52 rounded-[28px] border backdrop-blur-xl flex flex-col items-center justify-center text-center px-6 gap-4"
            style={{
              background: "var(--color-surface-glass-card)", 
              borderColor: "var(--color-surface-glass-card-border)",
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1) 0 8px 24px rgba(0, 0, 0, 0.3)",
            }}
          > 
            <H2 style={{ color: "var(--color-text-muted)" }}>No flagged content</H2>
          </div>
        )}
      </div>
      {/**Metadata View */}
      {selectedExp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedExp(null)}
        >
          <div 
            className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl p-9 flex flex-col gap-2 items-start"
            style={{
              background: "var(--color-surface-glass-card)", 
              borderColor: "var(--color-surface-glass-card-border)",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={((e) => e.stopPropagation())}
          >
            <div className="flex items-baseline gap-2">
              <Body style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>Reference ID:</Body>
              <Body style={{ fontSize: "13px"}}>#{selectedExp.id}</Body>
            </div>
            <div className="flex items-baseline gap-2">
              <Body style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>Owner:</Body>
              <Body style={{ fontSize: "13px"}}>@{selectedExp.user_id}</Body>
            </div>
            <div className="flex items-baseline gap-2">
              <Body style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>Submitted:</Body>
              <Body style={{ fontSize: "13px"}}>{selectedExp.submitted_at}</Body>
            </div>
            <div className="flex items-baseline gap-2">
              <Body style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>Status:</Body>
              <Body style={{ fontSize: "13px"}}>{selectedExp.status}</Body>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {(selectedExp.emotion_tags ?? []).map((tag) => (
              <div
                key={tag}
                className="px-3 py-1 rounded-full border text-xs"
                style={{ 
                  background: "var(--color-surface-glass-card)",
                  borderColor: "var(--color-surface-glass-card-border)", 
                  fontSize: "13px" }}
              >
                <Body style={{ fontSize: "13px"}}>
                  🏷 {tag}
                </Body>
              </div>
              ))}
            </div>
            {/**Buttons: approve and escalate flagged experience */}
            <div className="flex gap-6 mt-4">
              <GlassButton className="flex-1" onClick={() => {handleEscalate(selectedExp.id); setSelectedExp(null)}}>
                Escalate
              </GlassButton>
              <GlassButton className="flex-1" onClick={() => {handleApprove(selectedExp.id); setSelectedExp(null)}}>
                Approve
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
