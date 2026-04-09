import React, { useState } from "react";
import { colors, typography } from "../design-tokens";
import { H3, BodySmall } from "./Typography";

interface ExperienceCardProps {
  imageUrl?: string;
  imageAlt: string;
  title: string;
  date: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  onClick?: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  imageUrl,
  imageAlt,
  title,
  date,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const baseShadow = "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
  const hoverShadow = `${baseShadow}, 0 0 30px ${colors.button.warmGlow}`;

  return (
    <div
      className="relative overflow-hidden h-44 rounded-[28px] border backdrop-blur-xl transition-all duration-300 cursor-pointer"
      style={{
        background: "var(--color-surface-glass-card)",
        borderColor: isHovered ? colors.surface.glassCardBorderHover : colors.surface.glassCardBorder,
        boxShadow: isHovered ? hoverShadow : baseShadow,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: imageLoaded ? 1 : 0 }}
          onLoad={() => setImageLoaded(true)}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
      />
      <div
        className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)" }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <H3
          className="text-base mb-1"
          style={{
            fontFamily: typography.fonts.serif,
            textShadow: typography.shadows.textStrong,
            color: colors.text.onImage,
          }}
        >
          {title}
        </H3>
        <BodySmall
          className="text-xs mb-2"
          style={{
            fontFamily: typography.fonts.sansSerif,
            textShadow: typography.shadows.textStrong,
            color: colors.text.onImage,
          }}
        >
          {date}
        </BodySmall>
      </div>
    </div>
  );
};