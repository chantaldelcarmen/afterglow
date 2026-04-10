import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { colors, effects } from "../design-tokens";
import { H2, Body, BodySmall } from "./Typography";
import type { HelpContent } from "../data/help-content";

interface HelpModalProps {
  content: HelpContent;
  onClose: () => void;
}

export function HelpModal({ content, onClose }: HelpModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 md:left-60 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border p-6 space-y-4"
        style={{
          background: colors.surface.glassCard,
          borderColor: colors.surface.glassCardBorder,
          boxShadow: effects.shadows.card,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <H2>{content.title}</H2>
            <BodySmall className="mt-1" style={{ color: colors.text.mutedDim }}>
              {content.description}
            </BodySmall>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background: colors.surface.glass, color: colors.text.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.text.primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.text.muted; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Tips */}
        <div className="space-y-3">
          {content.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: colors.surface.glass, border: `1px solid ${colors.surface.glassCardBorder}` }}
              >
                <Body style={{ fontSize: "10px", color: colors.text.mutedDim }}>{i + 1}</Body>
              </div>
              <BodySmall style={{ color: colors.text.muted, lineHeight: "1.6" }}>{tip}</BodySmall>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
