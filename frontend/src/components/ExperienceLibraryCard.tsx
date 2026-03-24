import { useNavigate } from "react-router-dom";
import type { Experience } from "../types/experience";

type Props = {
  experience: Experience;
};

export default function ExperienceLibraryCard({ experience }: Props) {
    const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/experience/${experience.id}`)}
      className="relative h-56 overflow-hidden rounded-[28px] border border-white/10 bg-white/10 text-left shadow-lg transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 p-4 text-[#F8EBDD]">
        <h3 
          className="text-2xl leading-tight font-semibold drop-shadow-md"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {experience.title}
        </h3>
        <p className="mt-2 text-lg text-white/80">{experience.date}</p>
      </div>
    </button>
  );
}