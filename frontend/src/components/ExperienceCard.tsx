import React, { useState } from "react";
import { colors, typography } from "../design-tokens";
import { ImageOverlay } from "./ImageOverlay";
import { GlowOverlay } from "./GlowOverlay";
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
  buttonLabel = "Relive",
  onButtonClick,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Same glass-frame shadow as AI Reflection / Insight cards
  const baseShadow =
    "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
  const hoverShadow = `${baseShadow}, 0 0 30px ${colors.button.warmGlow}`;

  return (
    <div
      className="relative overflow-hidden h-44 rounded-[28px] border backdrop-blur-xl transition-all duration-300 cursor-pointer"
      style={{
        // let the image + overlays handle the surface; don’t fight them
        background: "transparent",
        borderColor: isHovered
          ? colors.surface.glassCardBorderHover
          : colors.surface.glassCardBorder,
        boxShadow: isHovered ? hoverShadow : baseShadow,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Full-bleed background image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}


      {/* Unified image overlay (purple tint + bottom fade) */}
      <ImageOverlay />

      {/* Glow overlay */}
      <GlowOverlay />

      {/* Text content in gradient area */}
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