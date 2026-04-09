import { apiFetch } from './api';

export interface PatternStats {
  most_active_month: { month: string; count: number } | null;
  most_frequent_emotion: { tag: string; count: number; percentage: number } | null;
  most_visited_location: { location: string; count: number } | null;
  most_active_time_of_day: { period: string; count: number } | null;
}

export interface AIReflection {
  reflection: string;
  month: string;
}

const MOCK_STATS: MappedPatternStats = {
  most_active_month: "March 2026",
  most_active_month_count: 24,
  most_frequent_emotion: "Joyful",
  most_frequent_emotion_percentage: 67,
  most_visited_place: "Riverside Café",
  most_visited_place_count: 12,
  most_active_time_of_day: "Golden Hour",
  most_active_time_range: "6:00 PM - 8:00 PM",
};

const MOCK_REFLECTION: AIReflection = {
  reflection:
    "Your March has been a tapestry of connection and growth. You've spent the most time with loved ones at cozy cafés, finding joy in simple moments of togetherness. Your most active times tend to be in the golden hours of evening, when the world slows down and you can truly be present. This month, you've cultivated a beautiful balance between adventure and reflection.",
  month: "March 2026",
};

export interface MappedPatternStats {
  most_active_month: string | null;
  most_active_month_count: number | null;
  most_frequent_emotion: string | null;
  most_frequent_emotion_percentage: number | null;
  most_visited_place: string | null;
  most_visited_place_count: number | null;
  most_active_time_of_day: string | null;
  most_active_time_range: string;
}

function formatMonth(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}


export async function getPatternStats(): Promise<MappedPatternStats> {
  try {
    const res = await apiFetch('/patterns', { method: 'GET' });
    const data: PatternStats = await res.json();
    // Note: most_active_time_of_day period is based on UTC hour of created_at, may differ from user's local time
    return {
      most_active_month: data.most_active_month ? formatMonth(data.most_active_month.month) : null,
      most_active_month_count: data.most_active_month?.count ?? null,
      most_frequent_emotion: data.most_frequent_emotion?.tag ?? null,
      most_frequent_emotion_percentage: data.most_frequent_emotion?.percentage ?? null,
      most_visited_place: data.most_visited_location?.location ?? null,
      most_visited_place_count: data.most_visited_location?.count ?? null,
      most_active_time_of_day: data.most_active_time_of_day?.period ?? null,
      most_active_time_range: "",
    };
  } catch {
    // TODO: replace with real endpoint once #93 is merged
    return MOCK_STATS;
  }
}

export async function getAIReflection(): Promise<AIReflection | null> {
  try {
    const res = await apiFetch('/patterns/ai-reflection', { method: 'GET' });
    const data: { enabled: boolean; insight: string | null } = await res.json();
    if (!data.enabled || !data.insight) return null;
    return { reflection: data.insight, month: "" };
  } catch {
    // TODO: replace with real endpoint once #96 is merged
    return MOCK_REFLECTION;
  }
}