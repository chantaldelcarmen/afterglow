import { useNavigate } from "react-router-dom";
import type { Experience } from "../types/experience";
import { colors, effects } from "../design-tokens";
import { ImageOverlay } from "../components/ImageOverlay";
import { GlowOverlay } from "../components/GlowOverlay";
import { H2, BodySmall } from "../components/Typography"


type Props = {
  experience: Experience;
};

export default function ExperienceLibraryCard({ experience }: Props) {
  const navigate = useNavigate();

  const coverImage = null; // TODO: change this
  const displayDate = experience.experience_date ?? experience.start_date ?? null;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    })
    : null;


  return (
    <button
      type="button"
      onClick={() => navigate(`/experience/${experience.id}`)}
      className="relative h-64 overflow-hidden rounded-3xl border text-left transition-all duration-300 hover:scale-[1.03] focus:outline-none"
      style={{
        background: colors.surface.glassCard,
        borderColor: colors.surface.glassCardBorder,
        boxShadow: effects.shadows.card,
      }}
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={experience.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: colors.surface.glass }} />
      )}

      <ImageOverlay />
      <GlowOverlay />

      <div className="absolute bottom-0 left-0 p-4">
        <H2 className="leading-tight">{experience.title}</H2>
        {formattedDate && (
          <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>
        )}
      </div>
    </button>
  );
}