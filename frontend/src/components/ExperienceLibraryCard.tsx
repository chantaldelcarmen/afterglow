import { useNavigate } from "react-router-dom";
import type { Experience } from "../types/experience";
import { ExperienceCard } from "../components/ExperienceCard";

type Props = {
  experience: Experience;
};

export default function ExperienceLibraryCard({ experience }: Props) {
  const navigate = useNavigate();

  const coverImage = null; // TODO: load from fragments
  const displayDate = experience.experience_date ?? experience.start_date ?? null;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "No date";

  return (
    <ExperienceCard
      imageUrl={coverImage ?? ""}
      imageAlt={experience.title}
      title={experience.title}
      date={formattedDate}
      onClick={() => navigate(`/experience/${experience.id}`)}
    />
  );
}