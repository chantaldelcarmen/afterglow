import { useEffect, useState, useRef } from "react";
import ExperienceLibraryCard from "../components/ExperienceLibraryCard";
import type { Experience } from "../types/experience";
import { getUserExperiences } from "../lib/experience";
import { SearchBar } from "../components/SearchBar";
import { SearchPanel } from "../components/SearchPanel";
import { H1, H2, BodySmall } from "../components/Typography";
import { colors } from "../design-tokens";

export default function ExperienceLibrary() {
  const [search, setSearch] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadExperiences() {
      try {
        const data = await getUserExperiences();
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    };
    if (isSearchActive) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchActive]);

  const handleFilterToggle = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearch("");
    setDateRange({ start: "", end: "" });
  };

  const filteredExperiences = experiences.filter((exp: Experience) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      q.length === 0 ||
      exp.title.toLowerCase().includes(q) ||
      (exp.location && exp.location.toLowerCase().includes(q)) ||
      (exp.emotion_tags && exp.emotion_tags.some((tag) => tag.toLowerCase().includes(q)));

    const yearFilters = activeFilters.filter((f) => ["2024", "2023", "2022"].includes(f));
    const displayDate = exp.experience_date ?? exp.start_date ?? null;
    const expYear = displayDate ? new Date(displayDate).getFullYear().toString() : null;
    const matchesFilters =
      yearFilters.length === 0 || (expYear && yearFilters.includes(expYear));

    let matchesDateRange = true;
    if (displayDate && (dateRange.start || dateRange.end)) {
      const expDate = new Date(displayDate);
      if (dateRange.start) matchesDateRange = expDate >= new Date(dateRange.start);
      if (dateRange.end) matchesDateRange = matchesDateRange && expDate <= new Date(dateRange.end);
    }

    return matchesSearch && matchesFilters && matchesDateRange;
  });

  const experiencesByYear = filteredExperiences.reduce((acc, exp) => {
    const displayDate = exp.experience_date ?? exp.start_date ?? null;
    const year = displayDate ? new Date(displayDate).getFullYear() : 0;
    if (!acc[year]) acc[year] = [];
    acc[year].push(exp);
    return acc;
  }, {} as Record<number, Experience[]>);

  const years = Object.keys(experiencesByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="max-w-[1000px] mx-auto h-full flex flex-col">
      <div className="sticky top-0 z-20 pt-6 pb-4">
        <H1 className="px-1 mb-1">Your Library</H1>
        <BodySmall className="px-1 mb-4" style={{ color: colors.text.mutedDim, fontSize: "13px" }}>
          Search and filter to find your moments
        </BodySmall>

        <div ref={searchContainerRef}>
          <SearchBar
            onActiveChange={setIsSearchActive}
            onQueryChange={setSearch}
            value={search}
          />
          <SearchPanel
            isVisible={isSearchActive}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
            onRecentClick={(val) => { setSearch(val); setActiveFilters([]); }}
            onClearFilters={handleClearFilters}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClosePanel={() => setIsSearchActive(false)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {loading && <p className="mt-8" style={{ color: colors.text.muted }}>Loading...</p>}
        {error && <p className="mt-8" style={{ color: colors.accent.coral }}>{error}</p>}

        {!loading && !error && (
          <div
            className="transition-opacity duration-300 space-y-6"
            style={{
              opacity: isSearchActive && search.length === 0 ? 0.3 : 1,
              pointerEvents: isSearchActive && search.length === 0 ? "none" : "auto",
            }}
          >
            {years.map((year) => (
              <div key={year} className="space-y-4">
                <H2 className="px-1">{year}</H2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {experiencesByYear[Number(year)].map((experience) => (
                    <ExperienceLibraryCard key={experience.id} experience={experience} />
                  ))}
                </div>
              </div>
            ))}

            {years.length === 0 && (
              <div className="text-center py-16 px-6">
                <div
                  className="inline-flex w-20 h-20 rounded-full mb-6 items-center justify-center"
                  style={{
                    backgroundColor: "rgba(147, 51, 234, 0.1)",
                    border: `1px solid ${colors.border.glass}`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: colors.glow.primary, opacity: 0.6 }}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <H2 className="mb-2">No experiences found</H2>
                <BodySmall style={{ color: colors.text.mutedDim }}>
                  {search || activeFilters.length > 0 || dateRange.start || dateRange.end
                    ? "Try adjusting your search or filters"
                    : "Your memory collection awaits your first experience"}
                </BodySmall>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}