import { supabase } from "../utils/supabase";
import type { Experience } from "../types/experience";

type SupabaseExperienceRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  experience_date: string | null;
};

export async function getExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*");

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error("Failed to fetch experiences");
  }

  return (data as SupabaseExperienceRow[]).map((item) => ({
    id: item.id,
    title: item.title,
    date: item.experience_date ?? "",
    year: item.experience_date
      ? new Date(item.experience_date).getFullYear()
      : new Date().getFullYear(),
    imageUrl: "",
    location: item.location ?? "",
    description: item.description ?? "",
    tags: [],
    fragments: [],
  }));
}