import React from "react";
import { Body, BodySmall } from "./Typography";

interface AIReflectionConsentModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function AIReflectionConsentModal({
  onConfirm,
  onCancel,
}: AIReflectionConsentModalProps) {
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(6px)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--color-surface-glass-card)",
    borderColor: "var(--color-surface-glass-card-border)",
    boxShadow:
      "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
  };

  const confirmButtonStyle: React.CSSProperties = {
    background: "var(--color-button-plum-bg)",
    borderColor: "var(--color-button-plum-border)",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
  };

  return (
    <div style={overlayStyle}>
      <div
        className="w-full max-w-sm rounded-3xl border backdrop-blur-xl p-6 space-y-5"
        style={cardStyle}
      >
        <div className="space-y-2">
          <Body style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
            Enable AI Reflection?
          </Body>
          <BodySmall style={{ color: "var(--color-text-muted-dim)", lineHeight: "1.7" }}>
            AI Reflection sends your experience titles, emotion tags, and
            locations to an external AI service to generate a monthly summary.
            No photos or fragment content are sent.
          </BodySmall>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full rounded-full border py-3 transition-all duration-300"
            style={confirmButtonStyle}
          >
            <Body style={{ color: "var(--color-text-primary)" }}>Enable</Body>
          </button>

          <button
            onClick={onCancel}
            className="w-full rounded-full border backdrop-blur-md py-3 transition-all duration-300"
            style={cardStyle}
          >
            <Body style={{ color: "var(--color-text-primary)" }}>Cancel</Body>
          </button>
        </div>
      </div>
    </div>
  );
}
