import { useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import ExperienceLibraryCard from "../components/ExperienceLibraryCard";
import { mockExperiences } from "../data/mockExperiences";

export default function ExperienceLibrary() {
  const [search, setSearch] = useState("");

  const filteredExperiences = useMemo(() => {
    return mockExperiences.filter((experience) =>
      experience.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(120,119,255,0.28),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(255,120,180,0.25),_transparent_30%),linear-gradient(180deg,_#17001F_0%,_#1B0326_100%)] text-[#F8EBDD] flex justify-center">
      <div className="w-full max-w-[430px] px-6 pt-8 pb-28">
        <div className="mb-8 flex justify-center">
          <div className="h-9 w-40 rounded-full bg-black" />
        </div>

        <h1 className="text-center text-6xl font-semibold tracking-tight">
          Afterglow
        </h1>

        <div className="mt-10">
          <div className="rounded-full border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
            <input
              type="text"
              placeholder="Search experiences..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-lg text-white placeholder:text-white/40 outline-none"
            />
          </div>
        </div>

        <h2 className="mt-8 text-3xl font-semibold">2024</h2>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {filteredExperiences.map((experience) => (
            <ExperienceLibraryCard
              key={experience.id}
              experience={experience}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}