import { useEffect, useState, useRef, useCallback } from "react";
import ExperienceLibraryCard from "../components/ExperienceLibraryCard";
import type { Experience } from "../types/experience";
import { getUserExperiences } from "../lib/experience";
import { SearchBar } from "../components/SearchBar";
import { SearchPanel } from "../components/SearchPanel";
import { H2, BodySmall } from "../components/Typography";
import { colors } from "../design-tokens";
import { Link } from "react-router-dom";
import { AppLogo } from "../components/AppLogo";
import { HelpButton } from "../components/HelpButton";
import { HELP_CONTENT } from "../data/help-content";


export default function ExperienceLibrary() {
  const [search, setSearch] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [mounted, setMounted] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const loadExperiences = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUserExperiences();
      setExperiences(data);
    } catch (err) {
      console.error(err);
      setError("Could not load experiences.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

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
    // Exclude draft experiences from library view
    if (exp.is_draft) return false;

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

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  const years = Object.keys(experiencesByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="h-full flex flex-col">
      <div
        className="sticky top-0 z-20 pb-6 px-6 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transitionDelay: "50ms",
        }}
      >
        <AppLogo />
        <div className="flex items-start justify-between px-1 mb-1">
          <div>
            <H2>Your Library</H2>
            <BodySmall className="mt-1 mb-4" style={{ color: colors.text.mutedDim, fontSize: "13px" }}>
              search and filter to find your moments
            </BodySmall>
          </div>
          <HelpButton content={HELP_CONTENT["/library"]} />
        </div>

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

      <div className="flex-1 overflow-y-auto pb-24 px-6">
        <div
          className="transition-all duration-700 space-y-6"
          style={{
            opacity: loading ? 0 : 1,
            transform: loading ? "translateY(12px)" : "translateY(0)",
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          {error && (
            <div className="mt-8 text-center space-y-3">
              <p style={{ color: colors.accent.coral }}>
                Couldn't connect to Afterglow. Check your connection and try again.
              </p>
              <button
                onClick={() => {
                  setError("");
                  setLoading(true);
                  loadExperiences();
                }}
                style={{ color: colors.text.muted, textDecoration: "underline", fontSize: "13px" }}
              >
                Try again
              </button>
            </div>
          )}

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

            {years.length === 0 && !loading && !error && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] py-20 px-6 text-center">
                <H2 className="mb-2">
                  {search || activeFilters.length > 0 || dateRange.start || dateRange.end
                    ? "No matches found."
                    : "no experiences yet."}
                </H2>
                <BodySmall style={{ color: colors.text.muted, maxWidth: "240px" }}>
                  {search || activeFilters.length > 0 || dateRange.start || dateRange.end
                    ? "try adjusting your search or filters"
                    : <Link
                      to="/create-experience"
                      style={{ color: colors.accent.gold }}
                    >
                      create an experience →
                    </Link>
                  }
                </BodySmall>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}