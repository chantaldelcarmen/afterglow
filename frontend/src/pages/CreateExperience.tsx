import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { H2, Body, BodySmall } from "../components/Typography";
import { AppLogo } from "../components/AppLogo";
import { apiFetch } from "../lib/api";

const EMOTION_OPTIONS = [
  "Joy",
  "Nostalgic",
  "Calm",
  "Bittersweet",
  "Overwhelmed",
  "Grateful",
  "Anxious",
];

const inputStyle = {
  background: "var(--color-surface-glass-card)",
  borderColor: "var(--color-surface-glass-card-border)",
  color: "var(--color-text-primary)",
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
};

const inputFocusStyle = {
  boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px var(--color-button-warm-glow)`,
  borderColor: "var(--color-surface-glass-card-border-hover)",
};

const inputBlurStyle = {
  boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
  borderColor: "var(--color-surface-glass-card-border)",
};

export default function CreateExperience() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmotionToggle = (tag: string) => {
    setEmotionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleCreate = async () => {
    if (!title.trim() || !date.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch("/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          experience_date: date,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          emotion_tags: emotionTags,
        }),
      });
      const created = await res.json();
      navigate(`/upload?experienceId=${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create experience");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = !!title.trim() && !!date.trim();

  return (
    <div className="max-w-175 mx-auto h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 pb-4 px-6">
        {/* Mobile Header */}
        <div className="md:hidden">
          <AppLogo />
          <H2 className="px-1">Create Experience</H2>
          <BodySmall className="px-1 mt-1" style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}>
            Craft a container for your memory fragments
          </BodySmall>
        </div>

        {/* Desktop Header + Back Button */}
        <div className="hidden md:block">
          <button
            onClick={() => navigate(-1)}
            className="flex w-10 h-10 rounded-full items-center justify-center backdrop-blur-xl transition-all duration-300 mb-4 border"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderColor: "var(--color-button-warm-border)",
              boxShadow: "0 0 16px var(--color-button-warm-glow)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 24px var(--color-button-warm-glow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 16px var(--color-button-warm-glow)";
            }}
          >
            <ArrowLeft size={20} style={{ color: "var(--color-text-primary)" }} />
          </button>
          <H2 className="px-1">Create Experience</H2>
          <BodySmall className="px-1 mt-1" style={{ color: "var(--color-text-muted-dim)", fontSize: "13px" }}>
            Craft a container for your memory fragments
          </BodySmall>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-0">
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
                        boxShadow: isActive
                          ? "0 2px 10px rgba(0,0,0,0.35), 0 0 20px var(--color-button-plum-glow-hover)"
                          : "none",
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
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.25), 0 0 18px rgba(246,237,227,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.25), 0 0 12px rgba(246,237,227,0.20)";
              }}
            >
              <Body style={{ color: "var(--color-text-muted)" }}>Cancel</Body>
            </button>

            {/* Create Experience */}
            <button
              onClick={handleCreate}
              disabled={!isFormValid || loading}
              className="w-full rounded-full border backdrop-blur-xl px-6 py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--color-button-plum-bg)",
                borderColor: "var(--color-button-plum-border)",
                boxShadow:
                  isButtonHovered && isFormValid
                    ? "0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)"
                    : "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              <Body style={{ color: "var(--color-text-primary)" }}>{loading ? "Creating..." : "Create Experience"}</Body>
            </button>
          </div>

          {/* Helper Text */}
          <BodySmall
            className="text-center pt-2"
            style={{ color: "var(--color-text-muted-dim)", fontStyle: "italic", fontSize: "13px" }}
          >
            Next, you'll add fragments to bring this memory to life
          </BodySmall>
        </div>
      </div>
    </div>
  );
}
