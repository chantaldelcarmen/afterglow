import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Body, BodySmall } from "../components/Typography";
import { SubpageHeader } from "../components/SubpageHeader";
import { apiFetch } from "../lib/api";

const DRAFT_KEY = "afterglow_create_draft";

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
  const [mounted, setMounted] = useState(false);
  const userHasEdited = useRef(false);
  const [touched, setTouched] = useState<{ title: boolean; date: boolean }>({
    title: false,
    date: false,
  });

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft);
      setTitle(parsed.title ?? "");
      setDate(parsed.date ?? "");
      setLocation(parsed.location ?? "");
      setDescription(parsed.description ?? "");
      setEmotionTags(parsed.emotionTags ?? []);
    }
  }, []);

  // Save draft on every change, but skip the initial render to avoid overwriting a restored draft
  useEffect(() => {
    if (!userHasEdited.current) { userHasEdited.current = true; return; }
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, date, location, description, emotionTags }));
  }, [title, date, location, description, emotionTags]);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  const handleEmotionToggle = (tag: string) => {
    setEmotionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const hasDraft = !!(title || date || location || description || emotionTags.length);

  const handleCreate = async () => {
    setTouched({ title: true, date: true });
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
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/upload?experienceId=${created.id}`);
    } catch (err) {
      // apiFetch throws Error("SESSION_EXPIRED") when the JWT is expired/invalid
      if (err instanceof Error && err.message === "SESSION_EXPIRED") {
        setError("SESSION_EXPIRED");
      } else {
        setError("Couldn't save your experience. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: "title" | "date") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid = !!title.trim() && !!date.trim();
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  const showTitleError = touched.title && !title.trim();
  const showDateError  = touched.date  && !date.trim();

  return (
    <div className="h-full flex flex-col">
      <SubpageHeader title="Create Experience" subtitle="Craft a container for your memory fragments" />

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-24 md:pb-0 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "100ms",
        }}
      >
        <div className="space-y-6">
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
                  onBlur={(e) => {Object.assign(e.currentTarget.style, inputBlurStyle); handleBlur("title"); }}
                />
              </label>
              {showTitleError && (
                <BodySmall
                  className="mt-1 pl-2"
                  style={{ color: "var(--color-accent-coral)", fontSize: "12px" }}
                >
                  Title is required
                </BodySmall>
              )}
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
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTouched((prev) => ({ ...prev, date: true }));
                  }}
                  max={localToday}
                  className="w-full px-5 py-4 rounded-[28px] border backdrop-blur-xl transition-all duration-300 focus:outline-none"
                  style={{ ...inputStyle, colorScheme: "dark" }}
                  onFocus={(e) => { Object.assign(e.currentTarget.style, inputFocusStyle); handleBlur("date"); }}
                  onBlur={(e) => { Object.assign(e.currentTarget.style, inputBlurStyle); handleBlur("date"); }}
                />
              </label>
              {showDateError && (
                <BodySmall
                  className="mt-1 pl-2"
                  style={{ color: "var(--color-accent-coral)", fontSize: "12px" }}
                >
                  Date is required
                </BodySmall>
              )}
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

          {error && (
            <div className="text-center space-y-2">
              <p className="text-sm" style={{ color: "var(--color-accent-coral)" }}>
                {error === "SESSION_EXPIRED"
                  ? "Your session has expired."
                  : "Couldn't save your experience. Check your connection and try again."}
              </p>
              {error === "SESSION_EXPIRED" ? (
                <button
                  onClick={() => navigate("/sign-in")}
                  style={{ color: "var(--color-text-muted)", textDecoration: "underline", fontSize: "13px" }}
                >
                  Sign in again
                </button>
              ) : (
                <button
                  onClick={() => void handleCreate()}
                  style={{ color: "var(--color-text-muted)", textDecoration: "underline", fontSize: "13px" }}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          <div className="pt-6 space-y-3">
            <button
              onClick={() => { localStorage.removeItem(DRAFT_KEY); navigate(-1); }}
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

          {hasDraft && (
            <BodySmall className="text-center" style={{ color: "var(--color-text-muted-dim)", fontSize: "12px" }}>
              Draft saved locally
            </BodySmall>
          )}
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