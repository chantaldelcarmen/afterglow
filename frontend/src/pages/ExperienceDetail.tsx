import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getOneExperience } from "../lib/experience";
import { getFragmentSignedUrl } from "../lib/storage";
import type { Experience } from "../types/experience";
import { colors, effects } from "../design-tokens";
import { H1, H2, Body, BodySmall } from "../components/Typography";
import { ImageOverlay } from "../components/ImageOverlay";
import { GlowOverlay } from "../components/GlowOverlay";

export default function ExperienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    async function loadExperience() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getOneExperience(id);
        setExperience(data);
      } catch (err) {
        console.error(err);
        setError("Could not load experience.");
      } finally {
        setLoading(false);
      }
    }
    loadExperience();
  }, [id]);

  useEffect(() => {
    async function loadCoverImage() {
      if (!experience?.anchor_fragment_id) return;
      const url = await getFragmentSignedUrl(experience.id, experience.anchor_fragment_id);
      setCoverImage(url);
    }
    loadCoverImage();
  }, [experience?.id, experience?.anchor_fragment_id]);

  if (loading) return <p className="text-center text-xl" style={{ color: colors.text.primary }}>Loading...</p>;
  if (error) return <p className="mt-8" style={{ color: colors.accent.coral }}>{error}</p>;
  if (!experience) {
    return (
      <>
        <p className="text-center text-xl" style={{ color: colors.text.primary }}>Experience not found.</p>
        <div className="mt-6 text-center">
          <Link to="/library" style={{ color: colors.text.muted }}>Back to library</Link>
        </div>
      </>
    );
  }

  const displayDate = experience.experience_date ?? experience.start_date ?? null;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="w-full max-w-[430px] pb-28">

      {/* Back button */}
      <div className="absolute top-8 left-6 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: `1px solid ${colors.button.warmBorder}`,
            boxShadow: `0 0 16px ${colors.button.warmGlow}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 24px ${colors.button.warmGlow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 0 16px ${colors.button.warmGlow}`;
          }}
        >
          <ArrowLeft size={20} style={{ color: colors.text.primary }} />
        </button>
      </div>

      {/* Hero image */}
      <div className="relative h-[336px] overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={experience.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: colors.surface.glassCard }} />
        )}
        <ImageOverlay />
        <GlowOverlay />

        <div className="absolute bottom-8 left-6 right-6">
          <H1 className="mb-2">{experience.title}</H1>
          {formattedDate && (
            <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>
          )}
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
              <Body style={{ color: colors.text.primary }}>Relive Experience</Body>
            </button>
          </div>
        </div>
      </div>

      {/* About section */}
      <div className="px-6 pt-6 space-y-4">
        <div
          className="rounded-2xl border backdrop-blur-xl p-5"
          style={{
            background: colors.surface.glassCard,
            borderColor: colors.surface.glassCardBorder,
            boxShadow: effects.shadows.card,
          }}
        >
          <H2 className="mb-2">About this moment</H2>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {formattedDate && (
              <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>
            )}
            {experience.location && (
              <BodySmall style={{ color: colors.text.muted }}>· {experience.location}</BodySmall>
            )}
          </div>

          {experience.emotion_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {experience.emotion_tags.map((tag) => (
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

          <BodySmall style={{ color: colors.text.mutedDim, fontSize: "13px", lineHeight: "1.6" }}>
            {experience.description || "No description yet."}
          </BodySmall>
        </div>
      </div>
    </div>
  );
}