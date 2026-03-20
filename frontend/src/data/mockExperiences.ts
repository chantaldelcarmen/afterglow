import type { Experience } from "../types/experience";

// TODO: replace mock data with real data
export const mockExperiences: Experience[] = [
  {
    id: "1",
    title: "Golden Beach Sunset",
    date: "August 20, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    year: 2024,
  },
  {
    id: "2",
    title: "Summit Adventure",
    date: "July 15, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    year: 2024,
  },
  {
    id: "3",
    title: "Downtown Lights",
    date: "June 5, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    year: 2024,
  },
  {
    id: "4",
    title: "Morning Ritual",
    date: "May 12, 2024",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    year: 2024,
  },
];

export function getExperienceById(id: string) {
  return mockExperiences.find((experience) => experience.id === id);
}