import type { ReactNode } from "react";
import { Body, BodySmall } from "./Typography";

interface ConfirmationModalProps {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: "plum" | "coral";
  confirmDisabled?: boolean;
}

export function ConfirmationModal({
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "plum",
  confirmDisabled = false,
}: ConfirmationModalProps) {
  const confirmStyle =
    confirmVariant === "coral"
      ? {
          background: "var(--color-accent-coral)",
          borderColor: "var(--color-accent-coral)",
          color: "#fff",
        }
      : {
          background: "var(--color-button-plum-bg)",
          borderColor: "var(--color-button-plum-border)",
          color: "var(--color-text-primary)",
        };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[28px] border backdrop-blur-xl p-6 space-y-4"
        style={{
          background: "var(--color-surface-glass-card)",
          borderColor: "var(--color-surface-glass-card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 text-center">
          <Body style={{ color: "var(--color-text-primary)", fontSize: "18px" }}>{title}</Body>
          <BodySmall style={{ color: "var(--color-text-muted-dim)", lineHeight: "1.6" }}>{body}</BodySmall>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border backdrop-blur-xl px-4 py-3 transition-all duration-200"
            style={{
              background: "var(--color-surface-glass)",
              borderColor: "var(--color-surface-glass-card-border)",
              color: "var(--color-text-muted)",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border-hover)";
              e.currentTarget.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-surface-glass-card-border)";
              e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="flex-1 rounded-full border backdrop-blur-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ ...confirmStyle, fontFamily: "Inter, sans-serif", fontSize: "14px" }}
            onMouseEnter={(e) => {
              if (!confirmDisabled) e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
