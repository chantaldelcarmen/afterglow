import { useState } from "react";
import { SubpageHeader } from "../components/SubpageHeader";
import { BodySmall, H3 } from "../components/Typography";
import { colors } from "../design-tokens";
import { resetDemoData } from "../lib/admin";

export function AdminDashboard() {
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoReset() {
    const confirmed = window.confirm(
      "Reset all experience, fragment, reflection, and system flag data, then reseed demo content?",
    );

    if (!confirmed) {
      return;
    }

    setIsResetting(true);
    setStatus(null);
    setError(null);

    try {
      const result = await resetDemoData();
      setStatus(`${result.message} Seeded ${result.seededExperiences} demo experiences.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset demo data.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="h-full flex flex-col pb-8 overflow-y-auto">
      <SubpageHeader title="Admin Dashboard" subtitle="Platform management" />

      <section
        className="mx-6 mt-3 rounded-3xl border p-5"
        style={{
          background: colors.surface.glassCard,
          borderColor: colors.surface.glassCardBorder,
        }}
      >
        <H3>Demo Data</H3>
        <BodySmall className="mt-2" style={{ color: colors.text.muted }}>
          Use this for demos to wipe app content and reseed baseline sample data.
        </BodySmall>

        <button
          type="button"
          onClick={handleDemoReset}
          disabled={isResetting}
          className="mt-4 rounded-full border px-4 py-2 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            borderColor: colors.accent.coral,
            color: colors.text.primary,
            background: "rgba(229, 118, 120, 0.14)",
          }}
        >
          {isResetting ? "Resetting..." : "Reset & Reseed Demo DB"}
        </button>

        {status && (
          <BodySmall className="mt-3" style={{ color: colors.accent.turquoise }}>
            {status}
          </BodySmall>
        )}

        {error && (
          <BodySmall className="mt-3" style={{ color: colors.accent.coral }}>
            {error}
          </BodySmall>
        )}
      </section>
    </div>
  );
}
