import { Link, useParams } from "react-router-dom";
import { getExperienceById } from "../data/mockExperiences";

export default function ExperienceDetail() {
  const { id } = useParams();
  const experience = id ? getExperienceById(id) : undefined;

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
        <div className="mb-8 flex justify-center">
          <div className="h-9 w-40 rounded-full bg-black" />
        </div>

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
          <img
            src={experience.imageUrl}
            alt={experience.title}
            className="h-72 w-full object-cover"
          />

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
            This is a placeholder detail description for now. Later, this should
            come from the backend so each experience has its own full story,
            location, tags, and fragments.
          </p>
        </section>
      </div>
    </>
  );
}