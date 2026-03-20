import { Link, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { getExperienceById } from "../data/mockExperiences";

export default function ExperienceDetail() {
  const { id } = useParams();
  const experience = id ? getExperienceById(id) : undefined;

  if (!experience) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(120,119,255,0.28),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(255,120,180,0.25),_transparent_30%),linear-gradient(180deg,_#17001F_0%,_#1B0326_100%)] text-[#F8EBDD] flex justify-center">
        <div className="w-full max-w-[430px] px-6 pt-8 pb-28">
          <p className="text-center text-xl">Experience not found.</p>
          <div className="mt-6 text-center">
            <Link to="/library" className="text-white/80 underline">
              Back to library
            </Link>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(120,119,255,0.28),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(255,120,180,0.25),_transparent_30%),linear-gradient(180deg,_#17001F_0%,_#1B0326_100%)] text-[#F8EBDD] flex justify-center">
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

        <h1 className="text-center text-6xl font-semibold tracking-tight">
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

      <BottomNav />
    </main>
  );
}