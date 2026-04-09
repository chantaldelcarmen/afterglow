import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import Anthropic from '@anthropic-ai/sdk';

interface ExperienceRow {
  location: string | null;
  experience_date: string | null;
  emotion_tags: string[] | null;
  created_at: string;
}

interface AiExperienceRow {
  title: string;
  location: string | null;
  emotion_tags: string[] | null;
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
  private anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  private insightCache = new Map<string, { month: string; text: string }>();

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
   * Returns an AI-generated reflection for the current month.
   * Only runs if the user has opted in via ai_reflection_enabled in user_settings.
   * Result is cached in user_settings — cache invalidates automatically when the month changes.
   * Only titles, emotion tags, and locations are sent to Claude — no descriptions, no fragment content, no user ID.
   */
  async getMonthlyInsight(
    userId: string,
  ): Promise<{ enabled: boolean; insight: string | null }> {
    const { data: settings, error: settingsError } = await this.supabaseService
      .getClient()
      .from('user_settings')
      .select('ai_reflection_enabled')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      throw new InternalServerErrorException('Failed to fetch user settings');
    }

    if (!settings?.ai_reflection_enabled) {
      return { enabled: false, insight: null };
    }

    // const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-04"
    const currentMonth = new Date().toISOString().slice(0, 7);
    const cacheKey = `${userId}:${currentMonth}`;
    const cached = this.insightCache.get(cacheKey);
    if (cached?.month === currentMonth) {
      return { enabled: true, insight: cached.text };
    }

    const [year, month] = currentMonth.split('-');
    const start = `${year}-${month}-01`;
    const end = new Date(+year, +month, 1).toISOString();

    const { data: experiences, error: expError } = await this.supabaseService
      .getClient()
      .from('experiences')
      .select('title, location, emotion_tags')
      .eq('user_id', userId)
      .eq('is_draft', false)
      .gte('experience_date', start)
      .lt('experience_date', end)
      .returns<AiExperienceRow[]>();

    if (expError) {
      throw new InternalServerErrorException('Failed to fetch experiences');
    }

    if (!experiences || experiences.length === 0) {
      return { enabled: true, insight: null };
    }

    const text = await this.generateInsight(experiences, currentMonth);

    this.insightCache.set(cacheKey, { month: currentMonth, text });

    return { enabled: true, insight: text };
  }

  /**
   * Builds a prompt from sanitized experience data and calls Claude.
   * Only receives title, location, and emotion_tags — nothing else reaches Claude.
   */
  private async generateInsight(
    experiences: AiExperienceRow[],
    monthKey: string,
  ): Promise<string> {
    const [year, month] = monthKey.split('-');
    const monthLabel = new Date(+year, +month - 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    const titles = experiences.map(e => e.title).filter(Boolean);
    const tags = [
      ...new Set(
        experiences.flatMap(e => e.emotion_tags ?? []).filter(Boolean),
      ),
    ];
    const locations = [
      ...new Set(experiences.map(e => e.location).filter(Boolean)),
    ];

    const prompt = `
      You are writing a warm, personal monthly reflection for a user of a private memory app.

      Month: ${monthLabel}
      Experience titles: ${titles.join(', ')}
      Emotion tags: ${tags.length > 0 ? tags.join(', ') : 'none recorded'}
      Locations visited: ${locations.length > 0 ? locations.join(', ') : 'none recorded'}

      Write a warm, personal 3-4 sentence reflection in second person ("you").
      Synthesize the emotional texture of the month — do not list or summarize individual experiences.
      Do not mention the app, AI, or that this reflection was generated.
    `.trim();

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    return (response.content[0] as { type: 'text'; text: string }).text;
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
