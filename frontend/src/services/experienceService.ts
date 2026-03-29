import { supabase } from "../utils/supabase";
import type { Experience } from "../types/experience";

type SupabaseExperienceRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  experience_date: string | null;
  start_date: string | null;
  end_date: string | null;
  is_draft: boolean;
  user_id: string;
  anchor_fragment_id: string | null;
  created_at: string;
  updated_at: string;
  emotion_tags: string[];
};

function mapExperience(item: SupabaseExperienceRow): Experience {
  return {
     id: item.id,
    title: item.title,
    description: item.description ?? null,
    location: item.location ?? null,
    experience_date: item.experience_date ?? null,
    start_date: item.start_date ?? null,
    end_date: item.end_date ?? null,
    is_draft: item.is_draft ?? false,
    user_id: item.user_id,
    anchor_fragment_id: item.anchor_fragment_id ?? null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    emotion_tags: item.emotion_tags ?? [],
  };
}

export async function getExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*");

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error("Failed to fetch experiences");
  }

  return (data as SupabaseExperienceRow[]).map(mapExperience);
}

export async function getExperienceById(id: string): Promise<Experience> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase fetch by id error:", error);
    throw new Error("Failed to fetch experience");
  }

  return mapExperience(data as SupabaseExperienceRow);
}