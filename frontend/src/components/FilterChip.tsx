import { colors, effects } from "../design-tokens";
import { Body } from "./Typography";
import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, isActive = false, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full border backdrop-blur-[18px] transition-all duration-300 flex items-center gap-1.5"
      style={{
        background: isActive
          ? "rgba(159, 122, 234, 0.25)"
          : colors.button.plumGlassBg,
        borderColor: isActive
          ? "rgba(159, 122, 234, 0.6)"
          : colors.button.plumGlassBorder,
        boxShadow: isActive
          ? `0 2px 10px rgba(0,0,0,0.35), 0 0 24px rgba(159, 122, 234, 0.4)`
          : `0 2px 10px rgba(0,0,0,0.35), 0 0 12px ${colors.button.plumGlassGlow}`,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = colors.button.plumGlassBgHover;
          e.currentTarget.style.borderColor = colors.button.plumGlassBorderHover;
          e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.35), 0 0 20px ${colors.button.plumGlassGlowHover}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = colors.button.plumGlassBg;
          e.currentTarget.style.borderColor = colors.button.plumGlassBorder;
          e.currentTarget.style.boxShadow = `0 2px 10px rgba(0,0,0,0.35), 0 0 12px ${colors.button.plumGlassGlow}`;
        }
      }}
    >
      <Body className="text-sm">{label}</Body>
      {isActive && (
        <X 
          size={14} 
          style={{ 
            color: colors.text.primary,
            strokeWidth: 2.5 
          }} 
        />
      )}
    </button>
  );
}