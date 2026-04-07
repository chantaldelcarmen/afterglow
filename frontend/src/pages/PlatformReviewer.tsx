import { H2, BodySmall, Body } from "../components/Typography";
import { BackButton } from "../components/BackButton";
import { useEffect, useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { useAuth } from "../utils/AuthContext";
import { GlassButton } from "../components/GlassButton";

export function PlatformReviewer() {
  const [loading, setLoading] = useState(true);
  const [error] = useState("");
  const [mounted, setMounted] = useState(false);
  const { loading: authLoading } = useAuth();
  
  /*
  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(timer);
      setMounted(true);
    };
  }, []);
  */

  useEffect(() => {
    setLoading(false);
    setMounted(true);
  }, []);

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Body style={{ color: "var(--color-text-muted)" }}>Loading...</Body>
      </div>
    );
  }

  const flaggedContent = [
  { title: "Rooftop Summer Night", user_id: "alex", tags: ["joy", "nostalgia"], risk_signals: "Public link enabled" , status: "Pending"},
  { title: "Movie Night", user_id: "sam", tags: ["calm"], risk_signals: null, status: "Approved" },
  { title: "Grad day", user_id: "sam", tags: [], risk_signals: "User report about sharing settings", status: "Escalated"}, 
  ];

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
        <H2>Reviewer Dashboard</H2>
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
                  {/**First row: Experience, status */}              
                  <div className="flex items-center justify-between">
                    <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                      Experience
                    </BodySmall>
                    <div                
                      className="px-3 py-1 rounded-full border text-xs"
                      style={{ borderColor: "var(--color-surface-glass-card-border)", fontSize: "13px" }}
                    >
                      <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                        {experience.status}
                      </BodySmall>
                    </div>
                  </div>
                  {/**Second row: Experience title, created at data */}
                  <div className="flex items-center justify-between">
                    <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                      {experience.title}
                    </BodySmall>
                    <div>
                      <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                        Submitted time
                      </BodySmall>
                    </div>
                  </div>
                  {/**Third row: Owner */}
                  <div className="flex items-center justify-between">
                    <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                      Owner: @{experience.user_id}
                    </BodySmall>
                  </div>
                  {/**Fourth row: Experience tags */}
                  <div className="flex gap-2 flex-wrap mt-2">
                    {(experience.tags ?? []).map((tag) => (
                      <div
                        key={tag}
                        className="px-3 py-1 rounded-full border text-xs"
                        style={{ 
                          background: "var(--color-surface-glass-card)",
                          borderColor: "var(--color-surface-glass-card-border)", 
                          fontSize: "13px" }}
                      >
                        <BodySmall style={{ color: "var(--color-text-muted-dim)", fontSize: "13px"}}>
                          {tag}
                        </BodySmall>
                      </div>
                    ))}
                  </div>
                  {experience.risk_signals && (
                    <div 
                      className="rounded-[20px] border p-3 flex flex-col gap-2 mt-3"
                      style={{
                        background: "rgba(0, 0, 0, 0.25)", 
                        borderColor: "var(--color-surface-glass-card-border)",
                        boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1) 0 8px 24px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      <BodySmall>Risk Signals</BodySmall>
                      <BodySmall>- {experience.risk_signals}</BodySmall>
                    </div>
                  )}
                  {/**Buttons: approve and view metadata */}
                  <div className="flex gap-6 mt-4">
                    <GlassButton className="flex-1">
                        View metadata
                    </GlassButton>
                    <GlassButton className="flex-1">Approve</GlassButton>
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
    </div>
  );
}
