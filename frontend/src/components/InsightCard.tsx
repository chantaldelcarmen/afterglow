// components/InsightCard.tsx
import { Calendar, Heart, Users, MapPin, Sun, Sparkles } from "lucide-react";
import { colors, typography } from "../design-tokens";
import type { Insight } from "../data/insights-data";
import { H3, Label, BodySmall } from "./Typography";
import { useState } from "react";

interface InsightCardProps {
  insight: Insight;
}

const iconMap = {
  calendar: Calendar,
  heart: Heart,
  users: Users,
  "map-pin": MapPin,
  sun: Sun,
};

export function InsightCard({ insight }: InsightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = iconMap[insight.icon as keyof typeof iconMap];

  const baseShadow =
    "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)";
  const hoverShadow = `${baseShadow}, 0 0 30px rgba(246, 237, 227, 0.4)`; // warm glow

  return (
    <div
      className="relative overflow-hidden rounded-3xl border backdrop-blur-xl p-5 transition-all duration-300"
      style={{
        background: colors.surface.glassCard,          // glass style
        borderColor: colors.surface.glassCardBorder,   // glass border
        boxShadow: isHovered ? hoverShadow : baseShadow,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner glow (same as AI Reflection / GlassCard) */}
      <div
        className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)",
        }}
      />

      {/* Sparkle accent - animated */}
      <div
        className="absolute top-3 right-3 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.6 : 0,
        }}
      >
        <Sparkles
          size={16}
          style={{ color: insight.color }}
          className="animate-pulse"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: `${insight.color}15`,
            border: `1px solid ${insight.color}30`,
          }}
        >
          <IconComponent size={22} style={{ color: insight.color }} />
        </div>

        {/* Text */}
        <div className="flex-1">
          <Label className="mb-1">{insight.label}</Label>
          <H3 className="mb-0.5">{insight.value}</H3>
          {insight.subtitle && <BodySmall>{insight.subtitle}</BodySmall>}
        </div>
      </div>
    </div>
  );
}