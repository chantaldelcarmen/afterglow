import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export function BackButton({ onClick, className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={onClick ?? (() => navigate(-1))}
      className={`flex w-10 h-10 rounded-full items-center justify-center backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        background: "rgba(0,0,0,0.35)",
        boxShadow: "0 0 16px var(--color-button-warm-glow)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 24px var(--color-button-warm-glow)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px var(--color-button-warm-glow)"; }}
    >
      <ArrowLeft size={20} style={{ color: "var(--color-text-primary)" }} />
    </button>
  );
}
