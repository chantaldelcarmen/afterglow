import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { colors } from "../design-tokens";
import { HelpModal } from "./HelpModal";
import type { HelpContent } from "../data/help-content";

interface HelpButtonProps {
  content: HelpContent;
}

export function HelpButton({ content }: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: colors.surface.glass,
          border: `1px solid ${colors.surface.glassCardBorderHover}`,
          color: colors.text.muted,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = colors.text.primary;
          e.currentTarget.style.borderColor = colors.surface.glassCardBorderHover;
          e.currentTarget.style.boxShadow = `0 0 12px ${colors.button.warmGlow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = colors.text.mutedDim;
          e.currentTarget.style.borderColor = colors.surface.glassCardBorder;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <HelpCircle size={14} />
      </button>
      {open && <HelpModal content={content} onClose={() => setOpen(false)} />}
    </>
  );
}
