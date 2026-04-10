import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Body, BodySmall } from "../components/Typography";
import { LoadingScreen } from "../components/LoadingScreen";
import { SubpageHeader } from "../components/SubpageHeader";
import { apiFetch } from "../lib/api";

const EMOTION_OPTIONS = ["Joy", "Nostalgic", "Calm", "Bittersweet", "Overwhelmed", "Grateful", "Anxious"];

const inputStyle = {
  background: "var(--color-surface-glass-card)",
  borderColor: "var(--color-surface-glass-card-border)",
  color: "var(--color-text-primary)",
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
};

const inputFocusStyle = {
  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px var(--color-button-warm-glow)",
  borderColor: "var(--color-surface-glass-card-border-hover)",
};

const inputBlurStyle = {
  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
  borderColor: "var(--color-surface-glass-card-border)",
};

export function EditExperience() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(timer); setMounted(false); };
  }, []);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/experiences/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setDate(data.experience_date ?? "");
        setLocation(data.location ?? "");
        setDescription(data.description ?? "");
        setEmotionTags(data.emotion_tags ?? []);
      })
      .catch(() => setError("Failed to load experience"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleEmotionToggle = (tag: string) => {
    setEmotionTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSave = async () => {
    if (!title.trim() || !date.trim()) return;
    setError("");
    setLoading(true);
    try {
      await apiFetch(`/experiences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          experience_date: date,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          emotion_tags: emotionTags,
        }),
      });
      navigate(`/experience/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save experience");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !!title.trim() && !!date.trim();
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  if (fetching) return <LoadingScreen />;

  return (
    <div className="h-full flex flex-col">
      <SubpageHeader title="Edit Experience" subtitle="Update your memory" />

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-24 md:pb-0 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "100ms",
        }}
      >
        <div className="space-y-6 pt-5">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label>
                <BodySmall className="mb-2 block" style={{ color: "var(--color-text-muted)" }}>
                  Title <span style={{ color: "var(--color-accent-coral)" }}>*</span>
                </BodySmall>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  placeholder="A moment worth remembering..."
                  className="w-full px-5 py-4 rounded-[28px] border backdrop-blur-xl transition-all duration-300 focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputBlurStyle)}
                />
              </label>
            </div>

            {/* Date */}
            <div>
              <label>
                <BodySmall className="mb-2 block" style={{ color: "var(--color-text-muted)" }}>
                  Date <span style={{ color: "var(--color-accent-coral)" }}>*</span>
                </BodySmall>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={localToday}
                  className="w-full px-5 py-4 rounded-[28px] border backdrop-blur-xl transition-all duration-300 focus:outline-none"
                  style={{ ...inputStyle, colorScheme: "dark" }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputBlurStyle)}
                />
              </label>
            </div>

            {/* Location */}
            <div>
              <label>
                <BodySmall className="mb-2 block" style={{ color: "var(--color-text-muted)" }}>
                  Location{" "}
                  <span style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}>(optional)</span>
                </BodySmall>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where did this happen?"
                  className="w-full px-5 py-4 rounded-[28px] border backdrop-blur-xl transition-all duration-300 focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputBlurStyle)}
                />
              </label>
            </div>

            {/* Description */}
            <div>
              <label>
                <BodySmall className="mb-2 block" style={{ color: "var(--color-text-muted)" }}>
                  Description{" "}
                  <span style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}>(optional)</span>
                </BodySmall>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What made this moment special?"
                  rows={4}
                  className="w-full px-5 py-4 rounded-[28px] border backdrop-blur-xl resize-none transition-all duration-300 focus:outline-none"
                  style={{ ...inputStyle, lineHeight: "1.6" }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, inputBlurStyle)}
                />
              </label>
            </div>

            {/* Emotion Tags */}
            <div>
              <BodySmall className="mb-1 block" style={{ color: "var(--color-text-muted)" }}>
                How did this experience feel?
              </BodySmall>
              <BodySmall className="mb-2 block" style={{ color: "var(--color-text-muted-dim)", fontSize: "12px" }}>
                Tap to select one or more
              </BodySmall>
              <div className="flex flex-wrap gap-2">
                {EMOTION_OPTIONS.map((tag) => {
                  const isActive = emotionTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleEmotionToggle(tag)}
                      className="px-3 py-2 rounded-full border text-xs backdrop-blur-xl transition-all duration-200"
                      style={{
                        background: isActive ? "var(--color-button-plum-bg-selected)" : "var(--color-button-plum-bg-dim)",
                        borderColor: isActive ? "var(--color-button-plum-border-hover)" : "var(--color-button-plum-border-dim)",
                        color: "var(--color-text-primary)",
                        boxShadow: isActive ? "0 2px 10px rgba(0,0,0,0.35), 0 0 20px var(--color-button-plum-glow-hover)" : "none",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm" style={{ color: "var(--color-accent-coral)" }}>
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="pt-6 space-y-3">
            {/* Cancel - mobile only */}
            <button
              onClick={() => navigate(-1)}
              className="md:hidden w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300"
              style={{
                background: "var(--color-surface-glass)",
                borderColor: "var(--color-button-warm-border)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.25), 0 0 12px rgba(246,237,227,0.20)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.25), 0 0 18px rgba(246,237,227,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.25), 0 0 12px rgba(246,237,227,0.20)"; }}
            >
              <Body style={{ color: "var(--color-text-muted)" }}>Cancel</Body>
            </button>

            {/* Save Changes */}
            <button
              onClick={handleSave}
              disabled={!isFormValid || loading}
              className="w-full rounded-full border backdrop-blur-xl px-6 py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--color-button-plum-bg)",
                borderColor: "var(--color-button-plum-border)",
                boxShadow: isButtonHovered && isFormValid
                  ? "0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)"
                  : "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              <Body style={{ color: "var(--color-text-primary)" }}>{loading ? "Saving..." : "Save Changes"}</Body>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}