import { useEffect, useMemo, useState } from "react";
import ExperienceLibraryCard from "../components/ExperienceLibraryCard";
import { getExperiences } from "../services/experienceService";
import type { Experience } from "../types/experience";
// import { mockExperiences } from "../data/mockExperiences";
import { Search } from "lucide-react";

export default function ExperienceLibrary() {
  const [search, setSearch] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExperiences() {
      try {
        const data = await getExperiences();
        console.log("SUPABASE EXPERIENCES:", data);
        setExperiences(data);
      } catch (err) {
        console.error(err);
        setError("Could not load experiences.");
      } finally {
        setLoading(false);
      }
    }

    loadExperiences();
  }, []);

  const filteredExperiences = useMemo(() => {
    // return mockExperiences.filter((experience) =>
    return experiences.filter((experience) =>
      experience.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [experiences, search]);

  return (
    <>

      <h1 className="playfair text-center text-5xl font-semibold tracking-tight text-[#F8EBDD] drop-shadow-[0_0_25px_rgba(255,230,150,0.6)]">
        Afterglow
      </h1>

      <div className="mt-8">
        <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
          <Search className="h-4 w-4 text-white/45" />
          <input
            type="text"
            placeholder="search experiences..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-lg text-white placeholder:text-white/40 outline-none"
          />
        </div>
      </div>

      {loading && <p className="mt-8 text-white/70">Loading...</p>}
      {error && <p className="mt-8 text-red-300">{error}</p>}

      {!loading && !error && (
        <>
          {/* TODO: group experiences dynamically by year! */}
          <h2 className="playfair mt-8 text-3xl font-semibold">2024</h2>


          {filteredExperiences.length === 0 ? (
            <p className="mt-6 text-white/70">No experiences found.</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {filteredExperiences.map((experience) => (
                <ExperienceLibraryCard
                  key={experience.id}
                  experience={experience}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}