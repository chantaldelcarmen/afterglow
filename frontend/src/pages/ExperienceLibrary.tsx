import { useMemo, useState } from "react";
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
    <>
        <div className="mb-8 flex justify-center">
          <div className="h-9 w-40 rounded-full bg-black" />
        </div>

        <h1 className="playfair text-center text-6xl font-semibold tracking-tight text-[#F8EBDD] drop-shadow-[0_0_25px_rgba(255,230,150,0.6)]">
          Afterglow
        </h1>

        <div className="mt-10">
          <div className="rounded-full border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
            <input
              type="text"
              placeholder="search experiences..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-lg text-white placeholder:text-white/40 outline-none"
            />
          </div>
        </div>

       {/* TODO: group experiences dynamically by year! */}
        <h2 className="playfair mt-8 text-3xl font-semibold">2024</h2>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {filteredExperiences.map((experience) => (
            <ExperienceLibraryCard
              key={experience.id}
              experience={experience}
            />
          ))}
        </div>
      </>
  );
}