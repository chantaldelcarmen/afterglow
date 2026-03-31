import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface ExperienceRow {
  location: string | null;
  experience_date: string | null;
  emotion_tags: string[];
  created_at: string;
}

export interface PatternsResponse {
  most_active_month: { month: string; count: number } | null;
  most_frequent_emotion: {
    tag: string;
    count: number;
    percentage: number;
  } | null;
  most_visited_location: { location: string; count: number } | null;
}

@Injectable()
export class PatternsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPatterns(userId: string): Promise<PatternsResponse> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('experiences')
      .select('location, experience_date, emotion_tags, created_at')
      .eq('user_id', userId)
      .eq('is_draft', false)
      .returns<ExperienceRow[]>();

    if (error) {
      throw new InternalServerErrorException('Failed to fetch patterns');
    }

    const experiences = data ?? [];

    return {
      most_active_month: this.getMostActiveMonth(experiences),
      most_frequent_emotion: this.getMostFrequentEmotion(experiences),
      most_visited_location: this.getMostVisitedLocation(experiences),
    };
  }

  private getMostActiveMonth(
    experiences: ExperienceRow[],
  ): { month: string; count: number } | null {
    const counts = new Map<string, number>();

    for (const exp of experiences) {
      if (!exp.experience_date) continue;
      const month = exp.experience_date.slice(0, 7); 
      counts.set(month, (counts.get(month) ?? 0) + 1);
    }

    if (counts.size === 0) return null;

    const [month, count] = [...counts.entries()].reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );

    return { month, count };
  }

  private getMostFrequentEmotion(
    experiences: ExperienceRow[],
  ): { tag: string; count: number; percentage: number } | null {
    const counts = new Map<string, number>();
    const total = experiences.length;

    if (total === 0) return null;

    for (const exp of experiences) {
      for (const tag of exp.emotion_tags) {
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    if (counts.size === 0) return null;

    const [tag, count] = [...counts.entries()].reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );

    const percentage = Math.round((count / total) * 100);

    return { tag, count, percentage };
  }

  private getMostVisitedLocation(
    experiences: ExperienceRow[],
  ): { location: string; count: number } | null {
    const counts = new Map<string, number>();

    for (const exp of experiences) {
      if (!exp.location) continue;
      const loc = exp.location.trim();
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
    }

    if (counts.size === 0) return null;

    const [location, count] = [...counts.entries()].reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );

    return { location, count };
  }

  
}
