import type { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  iconLeft?: ReactNode;
  type?: "button" | "submit";
}

export function GlassButton({
  children,
  onClick,
  size = "md",
  className = "",
  disabled = false,
  iconLeft,
  type = "button",
}: GlassButtonProps) {
  const padding = size === "sm" ? "px-4 py-2" : "px-5 py-3.5";
  const fontSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border backdrop-blur-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${padding} ${fontSize} ${className}`}
      style={{
        background: "var(--color-button-plum-bg)",
        borderColor: "var(--color-button-plum-border)",
        color: "var(--color-text-primary)",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "var(--color-button-plum-bg-hover)";
        e.currentTarget.style.borderColor = "var(--color-button-plum-border-hover)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--color-button-plum-bg)";
        e.currentTarget.style.borderColor = "var(--color-button-plum-border)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)";
      }}
    >
      {iconLeft}
      {children}
    </button>
  );
}