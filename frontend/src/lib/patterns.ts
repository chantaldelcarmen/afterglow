import { apiFetch } from './api';

export interface PatternStats {
  most_active_month: string;
  most_active_month_count: number;
  most_frequent_emotion: string;
  most_frequent_emotion_percentage: number;
  most_visited_place: string;
  most_visited_place_count: number;
  most_active_time_of_day: string;
  most_active_time_range: string;
}

export interface AIReflection {
  reflection: string;
  month: string;
}

const MOCK_STATS: PatternStats = {
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

export async function getPatternStats(): Promise<PatternStats> {
  try {
    const res = await apiFetch('/patterns', { method: 'GET' });
    return res.json();
  } catch {
    // TODO: replace with real endpoint once #93 is merged
    return MOCK_STATS;
  }
}

export async function getAIReflection(): Promise<AIReflection> {
  try {
    const res = await apiFetch('/patterns/ai-reflection', { method: 'GET' });
    return res.json();
  } catch {
    // TODO: replace with real endpoint once #96 is merged
    return MOCK_REFLECTION;
  }
}