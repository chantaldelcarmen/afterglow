import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Play } from "lucide-react";
import { colors, effects } from "../design-tokens";
import {
  H1,
  Body,
  BodySmall,
  H2,
} from "../components/Typography";
import { allExperiences } from "../data/experiences";
import { useState } from "react";
import { ImageOverlay } from "../components/ImageOverlay";
import { GlowOverlay } from "../components/GlowOverlay";

export function ExperienceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Find the experience by ID
  const experience = allExperiences.find(
    (exp) => exp.id === id,
  );

  // If no experience found, show error
  if (!experience) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Body style={{ color: colors.text.muted }}>
          Experience not found
        </Body>
      </div>
    );
  }

  // Optional emotion tags, if you later add them to the data
  const emotionTags = (experience as any).emotionTags as
    | string[]
    | undefined;

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="pb-32 md:pb-8">
        {/* Top Navigation - Mobile */}
        <div className="absolute top-8 left-6 right-6 flex items-center justify-start z-10 md:hidden">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderColor: colors.button.warmBorder,
              border: "1px solid",
              boxShadow: `0 0 16px ${colors.button.warmGlow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 24px ${colors.button.warmGlow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 16px ${colors.button.warmGlow}`;
            }}
          >
            <ArrowLeft
              size={20}
              style={{ color: colors.text.primary }}
            />
          </button>
        </div>

        {/* Top Navigation - Desktop */}
        <div className="hidden md:flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderColor: colors.button.warmBorder,
              border: "1px solid",
              boxShadow: `0 0 16px ${colors.button.warmGlow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 24px ${colors.button.warmGlow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 16px ${colors.button.warmGlow}`;
            }}
          >
            <ArrowLeft
              size={20}
              style={{ color: colors.text.primary }}
            />
          </button>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Hero Section - 40% height */}
          <div className="relative h-[336px] overflow-hidden">
            {/* Background Image */}
            <img
              src={experience.imageUrl}
              alt={experience.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Purple Gradient Overlay */}
            <ImageOverlay />
            <GlowOverlay />

            {/* Title, Date & Relive Button */}
            <div className="absolute bottom-8 left-6 right-6">
              <H1
                className="mb-2"
                style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                {experience.title}
              </H1>
              <BodySmall
                style={{
                  color: colors.text.muted,
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                {experience.date}
              </BodySmall>

              {/* Relive Button directly under title/date */}
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/relive/${id}`)}
                  className="w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300"
                  style={{
                    background: colors.button.plumGlassBg,
                    borderColor: colors.button.plumGlassBorder,
                    boxShadow: isButtonHovered
                      ? `0 4px 16px rgba(0,0,0,0.35), 0 0 25px ${colors.button.plumGlassGlowHover}`
                      : `0 2px 10px rgba(0,0,0,0.35), 0 0 18px ${colors.button.plumGlassGlow}`,
                  }}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                >
                  <Body style={{ color: colors.text.primary }}>
                    Relive Experience
                  </Body>
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 pt-6 space-y-4">
            {/* About this moment / metadata card */}
            {(experience.date ||
              (experience as any).location ||
              (experience as any).description ||
              (emotionTags && emotionTags.length > 0)) && (
              <div
                className="rounded-2xl border backdrop-blur-xl p-5"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <H2
                  className="mb-2"
                  style={{ fontSize: "18px" }}
                >
                  About this moment
                </H2>

                {/* Date + Location inline */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {experience.date && (
                    <BodySmall
                      style={{
                        color: colors.text.muted,
                      }}
                    >
                      {experience.date}
                    </BodySmall>
                  )}

                  {(experience as any).location && (
                    <BodySmall
                      style={{
                        color: colors.text.muted,
                        opacity: 0.9,
                      }}
                    >
                      · {(experience as any).location}
                    </BodySmall>
                  )}
                </div>

                {/* Emotion tags */}
                {emotionTags && emotionTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {emotionTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full border text-xs backdrop-blur-xl"
                        style={{
                          background: colors.surface.glass,
                          borderColor: colors.surface.glassCardBorder,
                          color: colors.text.primary,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {(experience as any).description && (
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {(experience as any).description}
                  </BodySmall>
                )}
              </div>
            )}

            {/* Fragments Section Label */}
            <H2 className="mb-4">Fragments</H2>

            {/* Photo Fragment */}
            <div
              className="relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 h-48"
              style={{
                background: colors.surface.glass,
                borderColor: colors.button.warmBorder,
                boxShadow: effects.shadows.card,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80"
                alt="Photo fragment"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <ImageOverlay />
              <div className="absolute bottom-4 left-4">
                <BodySmall
                  style={{
                    color: colors.text.primary,
                    textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }}
                >
                  Photo
                </BodySmall>
              </div>
            </div>

            {/* Text Memory Fragment */}
            <div
              className="rounded-2xl border backdrop-blur-xl p-6 transition-all duration-300"
              style={{
                background: colors.surface.glass,
                borderColor: colors.button.warmBorder,
                boxShadow: effects.shadows.card,
              }}
            >
              <BodySmall
                className="mb-2"
                style={{
                  color: colors.text.mutedDim,
                  fontStyle: "italic",
                }}
              >
                Memory
              </BodySmall>
              <Body
                style={{
                  color: colors.text.primary,
                  fontStyle: "italic",
                  lineHeight: "1.6",
                }}
              >
                "The city lights reflected in your eyes as we talked
                about everything and nothing. I remember thinking
                this is exactly where I'm supposed to be."
              </Body>
            </div>

            {/* Video Fragment */}
            <div
              className="relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 h-48"
              style={{
                background: colors.surface.glass,
                borderColor: colors.button.warmBorder,
                boxShadow: effects.shadows.card,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1758901433269-23c10cb7996d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGNhbWVyYSUyMHJlY29yZGluZyUyMG1lbW9yaWVzfGVufDF8fHx8MTc3MjQzNzUxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Video fragment"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <ImageOverlay />

              {/* Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300"
                  style={{
                    background: colors.surface.glass,
                    border: `2px solid ${colors.text.primary}`, // warm white outline
                    boxShadow: `0 0 24px ${colors.button.warmGlow}`,
                  }}
                >
                  <Play
                    size={24}
                    style={{
                      color: colors.text.primary,
                      fill: colors.text.primary,
                    }}
                  />
                </div>
              </div>

              <div className="absolute bottom-4 left-4">
                <BodySmall
                  style={{
                    color: colors.text.primary,
                    textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }}
                >
                  Video
                </BodySmall>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Split View */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:min-h-[600px]">
          {/* Left: Anchor Media */}
          <div className="relative overflow-hidden rounded-3xl border backdrop-blur-xl md:sticky md:top-8 md:h-[calc(100vh-120px)]" style={{
            background: colors.surface.glassCard,
            borderColor: colors.surface.glassCardBorder,
            boxShadow: effects.shadows.card,
          }}>
            <img
              src={experience.imageUrl}
              alt={experience.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <ImageOverlay />
            <GlowOverlay />
          </div>

          {/* Right: Metadata + Fragments */}
          <div className="space-y-6 overflow-y-auto pr-4">
            {/* Header */}
            <div>
              <H1 className="mb-2">{experience.title}</H1>
              <BodySmall style={{ color: colors.text.muted }}>
                {experience.date}
              </BodySmall>
            </div>

            {/* Relive Button */}
            <button
              onClick={() => navigate(`/relive/${id}`)}
              className="w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300"
              style={{
                background: colors.button.plumGlassBg,
                borderColor: colors.button.plumGlassBorder,
                boxShadow: isButtonHovered
                  ? `0 4px 16px rgba(0,0,0,0.35), 0 0 25px ${colors.button.plumGlassGlowHover}`
                  : `0 2px 10px rgba(0,0,0,0.35), 0 0 18px ${colors.button.plumGlassGlow}`,
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              <Body style={{ color: colors.text.primary }}>
                Relive Experience
              </Body>
            </button>

            {/* About this moment */}
            {(experience.date ||
              (experience as any).location ||
              (experience as any).description ||
              (emotionTags && emotionTags.length > 0)) && (
              <div
                className="rounded-2xl border backdrop-blur-xl p-5"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <H2
                  className="mb-2"
                  style={{ fontSize: "18px" }}
                >
                  About this moment
                </H2>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {experience.date && (
                    <BodySmall style={{ color: colors.text.muted }}>
                      {experience.date}
                    </BodySmall>
                  )}

                  {(experience as any).location && (
                    <BodySmall style={{ color: colors.text.muted, opacity: 0.9 }}>
                      · {(experience as any).location}
                    </BodySmall>
                  )}
                </div>

                {emotionTags && emotionTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {emotionTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full border text-xs backdrop-blur-xl"
                        style={{
                          background: colors.surface.glass,
                          borderColor: colors.surface.glassCardBorder,
                          color: colors.text.primary,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {(experience as any).description && (
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {(experience as any).description}
                  </BodySmall>
                )}
              </div>
            )}

            {/* Fragments */}
            <div className="space-y-4">
              <H2>Fragments</H2>

              {/* Photo Fragment */}
              <div
                className="relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 h-48"
                style={{
                  background: colors.surface.glass,
                  borderColor: colors.button.warmBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80"
                  alt="Photo fragment"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <ImageOverlay />
                <div className="absolute bottom-4 left-4">
                  <BodySmall
                    style={{
                      color: colors.text.primary,
                      textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                    }}
                  >
                    Photo
                  </BodySmall>
                </div>
              </div>

              {/* Text Memory Fragment */}
              <div
                className="rounded-2xl border backdrop-blur-xl p-6 transition-all duration-300"
                style={{
                  background: colors.surface.glass,
                  borderColor: colors.button.warmBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <BodySmall
                  className="mb-2"
                  style={{
                    color: colors.text.mutedDim,
                    fontStyle: "italic",
                  }}
                >
                  Memory
                </BodySmall>
                <Body
                  style={{
                    color: colors.text.primary,
                    fontStyle: "italic",
                    lineHeight: "1.6",
                  }}
                >
                  "The city lights reflected in your eyes as we talked
                  about everything and nothing. I remember thinking
                  this is exactly where I'm supposed to be."
                </Body>
              </div>

              {/* Video Fragment */}
              <div
                className="relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 h-48"
                style={{
                  background: colors.surface.glass,
                  borderColor: colors.button.warmBorder,
                  boxShadow: effects.shadows.card,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1758901433269-23c10cb7996d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGNhbWVyYSUyMHJlY29yZGluZyUyMG1lbW9yaWVzfGVufDF8fHx8MTc3MjQzNzUxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Video fragment"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <ImageOverlay />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300"
                    style={{
                      background: colors.surface.glass,
                      border: `2px solid ${colors.text.primary}`,
                      boxShadow: `0 0 24px ${colors.button.warmGlow}`,
                    }}
                  >
                    <Play
                      size={24}
                      style={{
                        color: colors.text.primary,
                        fill: colors.text.primary,
                      }}
                    />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4">
                  <BodySmall
                    style={{
                      color: colors.text.primary,
                      textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                    }}
                  >
                    Video
                  </BodySmall>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}