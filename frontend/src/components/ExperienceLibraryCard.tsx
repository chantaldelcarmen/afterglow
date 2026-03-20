import type { Experience } from "../types/experience";

type Props = {
  experience: Experience;
};

export default function ExperienceLibraryCard({ experience }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[28px] h-56 bg-white/10 border border-white/10 shadow-lg">
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 p-4 text-[#F8EBDD]">
        <h3 className="text-2xl leading-tight font-semibold drop-shadow-md">
          {experience.title}
        </h3>
        <p className="mt-2 text-lg text-white/80">{experience.date}</p>
      </div>
    </div>
  );
}