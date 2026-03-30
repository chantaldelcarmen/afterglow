import { Search } from "lucide-react";
import { colors, typography, effects } from "../design-tokens";
import { useState } from "react";

interface SearchBarProps {
  onActiveChange?: (active: boolean) => void;
  onQueryChange?: (query: string) => void;
  value?: string;
}

export function SearchBar({ onActiveChange, onQueryChange, value }: SearchBarProps) {
  const [isActive, setIsActive] = useState(false);

  const handleFocus = () => {
    setIsActive(true);
    onActiveChange?.(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange?.(e.target.value);
  };

  return (
    <div
      className="relative w-full rounded-full border backdrop-blur-xl px-4 py-3 flex items-center gap-3 transition-all duration-300"
      style={{
        background: colors.surface.glassCard,
        borderColor: isActive ? colors.surface.glassCardBorderHover : colors.surface.glassCardBorder,
        boxShadow: isActive 
          ? `inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px ${colors.button.warmGlow}`
          : "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Search size={18} className="opacity-50" style={{ color: colors.text.primary }} />
      <input
        type="text"
        placeholder="Search experiences..."
        className="flex-1 bg-transparent outline-none placeholder:opacity-40"
        style={{
          ...typography.styles.body,
          textShadow: typography.shadows.text,
        }}
        onFocus={handleFocus}
        onChange={handleInputChange}
        value={value}
      />
    </div>
  );
}