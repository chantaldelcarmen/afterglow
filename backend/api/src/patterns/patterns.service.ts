import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface ExperienceRow {
  location: string | null;
  experience_date: string | null;
  emotion_tags: string[] | null;
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
  most_active_time_of_day: { period: string; count: number } | null;
}

@Injectable()
export class PatternsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Fetches all published experiences for the user and computes aggregated pattern stats across four dimensions.
   * (Draft experiences are excluded)
   */
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
      most_active_time_of_day: this.getMostActiveTimeOfDay(experiences),
    };
  }

  /**
   * Returns the month with the highest number of experiences.
   * Based on experience_date (YYYY-MM). Returns null if no experiences have an experience_date set.
   */
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

  /**
   * Returns the most frequently used emotion tag across all experiences,
   * along with how many experiences it appears in and the percentage. Returns null if no experiences have emotion tags.
   * (In the case of a tie, the first tag encountered wins)
   */
  private getMostFrequentEmotion(
    experiences: ExperienceRow[],
  ): { tag: string; count: number; percentage: number } | null {
    const counts = new Map<string, number>();
    const total = experiences.length;

    if (total === 0) return null;

    for (const exp of experiences) {
      if (!exp.emotion_tags) continue;
      for (const tag of exp.emotion_tags) {
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    if (counts.size === 0) return null;

    const [tag, count] = [...counts.entries()].reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );

    // Percentage is relative to total experiences, not total tag occurrences
    const percentage = Math.round((count / total) * 100);

    return { tag, count, percentage };
  }

  /**
   * Returns the most frequently recorded location.
   * Null locations are ignored. Returns null if no experiences have a location set.
   */
  private getMostVisitedLocation(
    experiences: ExperienceRow[],
  ): { location: string; count: number } | null {
    const counts = new Map<string, number>();

    for (const exp of experiences) {
      if (!exp.location) continue;
      const loc = exp.location.trim().toLowerCase();
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
    }

    if (counts.size === 0) return null;

    const [location, count] = [...counts.entries()].reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );

    return { location, count };
  }

  /**
   * Buckets experiences by the UTC hour of their created_at timestamp:
   *   morning   → 6am  - 12pm
   *   afternoon → 12pm - 6pm
   *   evening   → 6pm  - 10pm
   *   night     → 10pm - 6am
   * Returns the period with the highest count, or null if no experiences exist.
   * Note: bucketing is based on UTC hour of created_at. Frontend should account for timezone offset when displaying results.
   */
  private getMostActiveTimeOfDay(
    experiences: ExperienceRow[],
  ): { period: string; count: number } | null {
    const counts = new Map<string, number>([
      ['morning', 0], // 6am - 12pm
      ['afternoon', 0], // 12pm - 6pm
      ['evening', 0], // 6pm - 10pm
      ['night', 0], // 10pm - 6am
    ]);

    for (const exp of experiences) {
      const hour = new Date(exp.created_at).getUTCHours();

      let period: string;
      if (hour >= 6 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 18) period = 'afternoon';
      else if (hour >= 18 && hour < 22) period = 'evening';
      else period = 'night';

      counts.set(period, (counts.get(period) ?? 0) + 1);
    }

    const [period, count] = [...counts.entries()].reduce((a, b) =>
      b[1] > a[1] ? b : a,
    );

    return count === 0 ? null : { period, count };
  }
}
