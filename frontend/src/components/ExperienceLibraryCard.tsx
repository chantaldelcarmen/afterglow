import { useNavigate } from "react-router-dom";
import type { Experience } from "../types/experience";

type Props = {
  experience: Experience;
};

export default function ExperienceLibraryCard({ experience }: Props) {
  const navigate = useNavigate();

  const coverImage = experience.fragments?.find(f => f.type === "photo")?.imageUrl;
  const displayDate = experience.experience_date ?? experience.start_date ?? null;



  return (
    <button
      type="button"
      onClick={() => navigate(`/experience/${experience.id}`)}
      className="relative h-52 overflow-hidden rounded-[28px] border border-white/10 bg-white/10 text-left shadow-[0_0_18px_rgba(255,230,150,0.08)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(255,230,150,0.22)] focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={experience.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/40">
          No image yet
        </div>
      )}


      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 p-4 text-[#F8EBDD]">
        <h3
          className="text-2xl leading-tight font-semibold drop-shadow-md"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {experience.title}
        </h3>
        {displayDate && (
          <p className="mt-2 text-lg text-white/80">
            {new Date(displayDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </button>
  );
}