
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOneExperience } from "../lib/experience";
import type { Experience } from "../types/experience";

export default function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p className="text-center text-xl">Loading...</p>;
  if (error) return <p className="mt-8 text-red-300">{error}</p>;
  if (!experience) {
    return (
      <>
        <p className="text-center text-xl">Experience not found.</p>
        <div className="mt-6 text-center">
          <Link to="/library" className="text-white/80 underline">
            Back to library
          </Link>
        </div>
      </>
    );
  }

  const coverImage = null; // TODO: load from fragments
  const displayDate = experience.experience_date ?? experience.start_date ?? null;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="w-full max-w-[430px] px-6 pt-8 pb-28">
      <div className="mb-6">
        <Link
          to="/library"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-md"
        >
          ←
        </Link>
      </div>

      <h1 className="playfair text-center text-5xl font-semibold tracking-tight text-[#F8EBDD] drop-shadow-[0_0_25px_rgba(255,230,150,0.6)]">
        Afterglow
      </h1>

      {/* Hero card with image + overlaid text */}
      <div className="relative mt-8 overflow-hidden rounded-[28px] shadow-lg">
        {coverImage ? (
          <img
            src={coverImage}
            alt={experience.title}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="h-72 w-full bg-white/10" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6">
          <h2
            className="text-4xl leading-tight font-semibold text-white"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {experience.title}
          </h2>
          {formattedDate && (
            <p className="mt-1 text-sm text-white/70">{formattedDate}</p>
          )}
          <button
            type="button"
            className="mt-4 w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-md"
          >
            Relive Experience
          </button>
        </div>
      </div>

      {/* About section */}
      <section className="mt-4 rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur-md">
        <h3 className="text-3xl font-semibold text-[#F8EBDD]"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          About this moment
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
          {formattedDate && <span>{formattedDate}</span>}
          {experience.location && (
            <>
              <span>·</span>
              <span>{experience.location}</span>
            </>
          )}
        </div>

        {experience.emotion_tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {experience.emotion_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/90"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-5 text-base leading-relaxed text-white/80">
          {experience.description || "No description yet."}
        </p>
      </section>
    </div>
  );
}