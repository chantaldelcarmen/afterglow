import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { colors, effects } from "../design-tokens";
import { H1, H3, Body, BodySmall } from "../components/Typography";
import { InsightCard } from "../components/InsightCard";
import type { MappedPatternStats, AIReflection } from "../lib/patterns";
import { getPatternStats, getAIReflection } from "../lib/patterns";
import type { Insight } from "../data/insights-data";

function buildInsights(stats: MappedPatternStats): Insight[] {
  return [
    {
      icon: "calendar",
      label: "Most Active Month",
      value: stats.most_active_month ?? "N/A",
      subtitle: stats.most_active_month_count ? `${stats.most_active_month_count} memories created` : undefined,
      color: "#788BE5",
    },
    {
      icon: "heart",
      label: "Most Frequent Emotion",
      value: stats.most_frequent_emotion ?? "N/A",
      subtitle: stats.most_frequent_emotion_percentage ? `Appears in ${stats.most_frequent_emotion_percentage}% of memories` : undefined,
      color: "#E576AC",
    },
    {
      icon: "map-pin",
      label: "Most Visited Place",
      value: stats.most_visited_place ?? "N/A",
      subtitle: stats.most_visited_place_count ? `${stats.most_visited_place_count} total visits` : undefined,
      color: "#F0C164",
    },
    {
      icon: "sun",
      label: "Most Active Time of Day",
      value: stats.most_active_time_of_day ?? "N/A",
      color: "#E57678",
    },
  ];
}

export function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [reflection, setReflection] = useState<AIReflection | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReflection, setLoadingReflection] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await getPatternStats();
        setInsights(buildInsights(stats));
      } catch {
        setError("Could not load patterns.");
      } finally {
        setLoadingStats(false);
      }
    }

    async function loadReflection() {
      try {
        const data = await getAIReflection();
        setReflection(data);
      } catch {
        setReflection(null);
      } finally {
        setLoadingReflection(false);
      }
    }

    loadStats();
    loadReflection();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 pt-6 pb-4">
        <div className="max-w-[1400px] mx-auto px-6">
          <H1 className="px-1">Your Patterns</H1>
          <BodySmall
            className="px-1 mt-1"
            style={{ color: colors.text.mutedDim, fontSize: "13px" }}
          >
            Discover emotional patterns through AI-powered analysis of your memories
          </BodySmall>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-28 md:pb-0">
        <div className="max-w-[1400px] mx-auto px-6">

          {/* Stat Cards */}
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            {loadingStats ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-3xl border backdrop-blur-xl p-5 h-24 animate-pulse"
                    style={{
                      background: colors.surface.glassCard,
                      borderColor: colors.surface.glassCardBorder,
                    }}
                  />
                ))}
              </div>
            ) : error ? (
              <div
                className="rounded-3xl border backdrop-blur-xl p-5"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                }}
              >
                <BodySmall style={{ color: colors.text.mutedDim }}>
                  Could not load pattern data.
                </BodySmall>
              </div>
            ) : insights.length === 0 ? (
              <div
                className="rounded-3xl border backdrop-blur-xl p-5"
                style={{
                  background: colors.surface.glassCard,
                  borderColor: colors.surface.glassCardBorder,
                }}
              >
                <BodySmall style={{ color: colors.text.mutedDim }}>
                  No patterns yet — start creating experiences to see your insights.
                </BodySmall>
              </div>
            ) : (
              insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))
            )}
          </div>

          {/* AI Reflection Section */}
          <div
            className="relative rounded-[28px] border backdrop-blur-xl p-5 mb-4 transition-all duration-300"
            style={{
              background: colors.surface.glassCard,
              borderColor: colors.surface.glassCardBorder,
              boxShadow: effects.shadows.card,
            }}
          >
            <div
              className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles
                  size={18}
                  style={{ color: colors.accent.gold }}
                  className="animate-pulse"
                />
                <H3>AI Reflection of the Month</H3>
              </div>

              {loadingReflection ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 rounded" style={{ background: colors.surface.glass }} />
                  <div className="h-4 rounded w-4/5" style={{ background: colors.surface.glass }} />
                  <div className="h-4 rounded w-3/5" style={{ background: colors.surface.glass }} />
                </div>
              ) : reflection ? (
                <Body className="leading-relaxed">
                  "{reflection.reflection}"
                </Body>
              ) : (
                <BodySmall style={{ color: colors.text.mutedDim }}>
                  AI Reflection is unavailable right now.
                </BodySmall>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}