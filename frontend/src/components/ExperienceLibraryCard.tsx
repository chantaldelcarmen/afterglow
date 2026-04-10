import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Experience } from "../types/experience";
import { getFragmentSignedUrl } from "../lib/storage";
import { ExperienceCard } from "../components/ExperienceCard";

type Props = {
  experience: Experience;
};

export default function ExperienceLibraryCard({ experience }: Props) {
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoverImage() {
      if (!experience.anchor_fragment_id) return;
      const url = await getFragmentSignedUrl(experience.id, experience.anchor_fragment_id);
      setCoverImage(url);
    }
    loadCoverImage();
  }, [experience.id, experience.anchor_fragment_id]);

  const displayDate = experience.experience_date ?? experience.start_date ?? null;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "No date";

  return (
    <ExperienceCard
      imageUrl={coverImage ?? undefined}
      imageAlt={experience.title}
      title={experience.title}
      date={formattedDate}
      is_draft={experience.is_draft}
      onClick={() => navigate(`/experience/${experience.id}`)}
    />
  );
}