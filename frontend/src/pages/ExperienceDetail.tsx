import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
//import { getExperienceById } from "../data/mockExperiences";
import { getExperienceById } from "../services/experienceService";
import type { Experience } from "../types/experience";

export default function ExperienceDetail() {
  const { id } = useParams();
   const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    async function loadExperience() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getExperienceById(id);
        setExperience(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadExperience();
  }, [id]);

  if (loading) {
    return <p className="text-center text-xl">Loading...</p>;
  }


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

  return (
    <>
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

        <div className="mt-8 overflow-hidden rounded-[28px] bg-white/10 shadow-lg">
          {experience.imageUrl ? (
          <img
            src={experience.imageUrl}
            alt={experience.title}
            className="h-72 w-full object-cover"
          />
          ) : null}

          <div className="bg-black/20 p-6">
            <h2 className="text-5xl leading-tight font-semibold">
              {experience.title}
            </h2>
            <p className="mt-3 text-xl text-white/80">{experience.date}</p>

            <button
              type="button"
              className="mt-6 w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-xl font-medium text-white backdrop-blur-md"
            >
              Relive Experience
            </button>
          </div>
        </div>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur-md">
          <h3 className="text-4xl font-semibold">About this moment</h3>
          <p className="mt-3 text-lg text-white/75">{experience.date}</p>

          {/*TODO: fix this hardcoded stuff */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">
              Peaceful
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">
              Warm
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">
              Reflective
            </span>
          </div>

          <p className="mt-5 text-lg leading-relaxed text-white/85">
             {experience.description || "No description yet."}
          </p>
        </section>
      </div>
    </>
  );
}