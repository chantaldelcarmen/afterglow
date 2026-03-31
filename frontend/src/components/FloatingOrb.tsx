import type { MouseEvent } from "react";
import { Link } from "react-router-dom";

interface FloatingOrbProps {
  mode: "default" | "upload";
  orbSize: number;
  orbBottomOffset: number;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function FloatingOrb({
  mode,
  orbSize,
  orbBottomOffset,
  to = "/create-experience",
  onClick,
  disabled = false,
}: FloatingOrbProps) {
  const wrapperStyle = {
    width: `${orbSize}px`,
    height: `${orbSize}px`,
    bottom: `${orbBottomOffset}px`,
    left: "50%",
    transform: "translate(-50%, 0)",
    zIndex: 43,
  } as const;

  const orbVisual = (
    <div
      className="rounded-full flex items-center justify-center shadow-2xl"
      style={{
        width: `${orbSize}px`,
        height: `${orbSize}px`,
        background: "radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 235, 1) 15%, rgba(255, 235, 205, 1) 28%, rgba(245, 215, 175, 1) 42%, rgba(225, 185, 145, 1) 58%, rgba(195, 150, 115, 1) 72%, rgba(165, 120, 90, 1) 85%, rgba(140, 95, 70, 1) 100%)",
        boxShadow: "inset 0 2px 20px rgba(255, 255, 255, 0.9), inset 0 -2px 15px rgba(140, 95, 70, 0.4), inset 0 0 30px rgba(255, 245, 225, 0.3), 0 0 20px rgba(205, 160, 135, 0.35), 0 0 35px rgba(195, 150, 125, 0.25), 0 8px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#321432" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
  );

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;
    event.currentTarget.style.transform = "translate(-50%, 0) scale(1.05)";
  };

  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "translate(-50%, 0) scale(1)";
  };

  return (
    <>
      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${orbBottomOffset - 6}px`,
          zIndex: 41,
          width: `${orbSize}px`,
          height: "12px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 30%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${orbBottomOffset}px`,
          zIndex: 41,
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(255, 240, 220, 1) 0%, rgba(250, 225, 200, 0.95) 20%, rgba(245, 210, 175, 0.8) 40%, rgba(225, 185, 145, 0.5) 65%, transparent 100%)",
          filter: "blur(45px)",
        }}
      />

      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${orbBottomOffset}px`,
          zIndex: 42,
          width: `${orbSize + 24}px`,
          height: `${orbSize + 24}px`,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.1) 85%, transparent 100%)",
          filter: "blur(12px)",
        }}
      />

      {mode === "default" ? (
        <Link
          to={to}
          className="fixed rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105"
          style={wrapperStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {orbVisual}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="fixed rounded-full flex items-center justify-center transition-transform duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            ...wrapperStyle,
            background: "transparent",
            border: "none",
            padding: 0,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {orbVisual}
        </button>
      )}
    </>
  );
}
