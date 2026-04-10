import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { getOneExperience } from "../lib/experience";
import { getFragments, getFragmentSignedUrl } from "../lib/storage";
import { createReflection } from "../lib/reflections";
import type { Experience } from "../types/experience";
import type { Fragment } from "../types/fragment";
import { colors } from "../design-tokens";
import { Body, BodySmall } from "../components/Typography";

type Phase = "context" | "peak" | "afterglow";

const PHASE_LABELS: Record<Phase, string> = {
  context: "Context",
  peak: "Peak",
  afterglow: "Afterglow",
};

const PHASE_ORDER: Phase[] = ["context", "peak", "afterglow"];

interface ReliveFragment extends Fragment {
  signedUrl: string | null;
  isAnchor: boolean;
}

export function ReliveExperience() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [contextFragments, setContextFragments] = useState<ReliveFragment[]>([]);
  const [peakFragment, setPeakFragment] = useState<ReliveFragment | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeToBlack, setFadeToBlack] = useState(true);
  const [phase, setPhase] = useState<Phase>("context");
  const [contextIndex, setContextIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showCaptionIntro, setShowCaptionIntro] = useState(true);
  const [showOpeningTitle, setShowOpeningTitle] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setFadeToBlack(false), 300);
    const t2 = setTimeout(() => setShowHint(false), 4000);
    const t3 = setTimeout(() => setShowCaptionIntro(false), 2500);
    const t4 = setTimeout(() => setShowOpeningTitle(false), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const loadExperience = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [exp, frags] = await Promise.all([
        getOneExperience(id),
        getFragments(id),
      ]);
      setExperience(exp);
      const withUrls: ReliveFragment[] = await Promise.all(
        frags.map(async (f: Fragment) => ({
          ...f,
          isAnchor: f.id === exp.anchor_fragment_id,
          signedUrl: f.storage_path
            ? await getFragmentSignedUrl(id, f.id)
            : null,
        }))
      );
      setContextFragments(withUrls.filter((f) => !f.isAnchor));
      setPeakFragment(withUrls.find((f) => f.isAnchor) ?? null);
    } catch {
      setError("Couldn't load this experience. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadExperience();
  }, [loadExperience]);

  // Auto-advance through context fragments
  useEffect(() => {
    if (loading || isPaused || phase !== "context") return;
    if (contextFragments.length === 0) {
      setPhase(peakFragment ? "peak" : "afterglow");
      return;
    }
    const timer = setTimeout(() => {
      if (contextIndex < contextFragments.length - 1) {
        setContextIndex((i) => i + 1);
      } else {
        setPhase(peakFragment ? "peak" : "afterglow");
      }
    }, 4500);
    return () => clearTimeout(timer);
  }, [loading, isPaused, phase, contextIndex, contextFragments.length, peakFragment]);

  // Auto-advance from peak to afterglow
  useEffect(() => {
    if (phase !== "peak" || isPaused) return;
    const timer = setTimeout(() => setPhase("afterglow"), 5500);
    return () => clearTimeout(timer);
  }, [phase, isPaused]);

const handleSaveReflection = async () => {
    if (!id || !reflectionText.trim() || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      await createReflection(id, reflectionText.trim());
      setShowSavedPopup(true);
      setTimeout(() => navigate(`/experience/${id}`), 1200);
    } catch {
      setSaving(false);
      setSaveError("Couldn't save your reflection. Check your connection and try again.");
    }
  };

  const handleSkip = () => navigate(`/experience/${id}`);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      // Go back
      if (phase === "peak") {
        if (contextFragments.length > 0) {
          setPhase("context");
          setContextIndex(contextFragments.length - 1);
        } else {
          navigate(`/experience/${id}`);
        }
      } else if (phase === "context") {
        if (contextIndex > 0) setContextIndex((i) => i - 1);
        else navigate(`/experience/${id}`);
      }
    } else if (x > (width * 2) / 3) {
      // Go forward
      if (phase === "context") {
        if (contextIndex < contextFragments.length - 1) {
          setContextIndex((i) => i + 1);
        } else {
          setPhase(peakFragment ? "peak" : "afterglow");
        }
      } else if (phase === "peak") {
        setPhase("afterglow");
      }
    } else {
      setIsPaused((prev) => {
        const next = !prev;
        setShowCaptionIntro(next);
        return next;
      });
    }
    if (showHint) setShowHint(false);
  };

  if (loading) return null;

  if (error) return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "linear-gradient(180deg, #0A0010 0%, #16001F 100%)" }}>
      <Body style={{ color: colors.accent.coral }}>{error}</Body>
      <BodySmall style={{ color: colors.text.muted }}>
        <button
          onClick={() => void loadExperience()}
          style={{ textDecoration: "underline" }}
        >
          Try again
        </button>
        {" or "}
        <button
          onClick={() => navigate(`/experience/${id}`)}
          style={{ textDecoration: "underline" }}
        >
          go back to experience
        </button>
      </BodySmall>
    </div>
  );

  if (!experience) {
    navigate(`/experience/${id}`);
    return null;
  }

  const displayDate = experience.experience_date ?? experience.start_date ?? null;
  const currentFragment = phase === "context" ? contextFragments[contextIndex] : peakFragment;
  const shouldShowCaption = !!currentFragment?.caption && (isPaused || showCaptionIntro);
  const prevFragment = phase === "context" && contextIndex > 0 ? contextFragments[contextIndex - 1] : null;
  const nextFragment = phase === "context" && contextIndex < contextFragments.length - 1
    ? contextFragments[contextIndex + 1]
    : null;

  return (
    <div className="absolute inset-0 z-50 overflow-hidden">
      {/* Fade to black overlay */}
      <AnimatePresence>
        {fadeToBlack && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black z-50"
          />
        )}
      </AnimatePresence>

      {/* Cinematic background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #0A0010 0%, #16001F 100%)" }}
      >
        {/* Violet orb - top left */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(147,51,234,0.5) 0%, transparent 70%)",
          }}
        />
        {/* Blue orb - middle right */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-10 w-72 h-72 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
          }}
        />
        {/* Pink orb - bottom center */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Afterglow reflection screen */}
      {phase === "afterglow" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
        >
          <div className="mb-4 pointer-events-none">
            <PhaseSteps currentPhase="afterglow" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mb-6"
          >
            <Body style={{ color: colors.text.muted, fontSize: "18px", fontStyle: "italic" }}>
              What did this moment mean to you?
            </Body>
            <BodySmall className="mt-2" style={{ color: colors.text.mutedDim, fontSize: "14px" }}>
              (Optional)
            </BodySmall>
          </motion.div>

          <motion.textarea
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Your reflection..."
            className="w-full max-w-md h-32 px-6 py-4 rounded-2xl border backdrop-blur-xl resize-none focus:outline-none transition-all duration-300"
            style={{
              background: colors.surface.glass,
              borderColor: colors.button.warmBorder,
              color: colors.text.primary,
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          />

          <div className="flex gap-3 mt-6 w-full max-w-md">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              onClick={handleSkip}
              className="flex-1 rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300"
              style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.button.warmBorder; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            >
              <BodySmall style={{ color: colors.text.muted }}>Maybe Later</BodySmall>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              onClick={() => void handleSaveReflection()}
              disabled={!reflectionText.trim() || saving}
              className="flex-1 rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300"
              style={{
                background: !reflectionText.trim() ? "rgba(255,255,255,0.05)" : colors.button.warmBgGradient,
                borderColor: colors.button.warmBorder,
                opacity: !reflectionText.trim() || saving ? 0.5 : 1,
                cursor: !reflectionText.trim() || saving ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!reflectionText.trim() || saving) return;
                e.currentTarget.style.boxShadow = `0 0 24px ${colors.button.warmGlow}`;
              }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <BodySmall style={{ color: colors.text.primary }}>
                {saving ? "Saving..." : "Save Reflection"}
              </BodySmall>
            </motion.button>
          </div>

          {saveError && (
            <BodySmall className="mt-3 text-center" style={{ color: colors.accent.coral }}>
              {saveError}
            </BodySmall>
          )}

          <AnimatePresence>
            {showSavedPopup && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="px-6 py-4 rounded-2xl border backdrop-blur-xl"
                  style={{
                    background: colors.surface.glass,
                    borderColor: colors.button.warmBorder,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
                  }}
                >
                  <BodySmall style={{ color: colors.text.primary }}>Reflection saved ✨</BodySmall>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Back button, phase indicator, and fragment display (hidden during afterglow) */}
      {phase !== "afterglow" && (
        <>
          <motion.button
            onClick={() => navigate(`/experience/${id}`)}
            className="absolute top-8 left-6 z-30 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: `1px solid ${colors.button.warmBorder}`,
            }}
            animate={{ opacity: isPaused ? 1 : 0.5 }}
            whileHover={{ opacity: 1 }}
          >
            <ArrowLeft size={20} style={{ color: colors.text.primary }} />
          </motion.button>

          {/* Phase step indicator */}
          <div className="absolute top-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
            <PhaseSteps currentPhase={phase} />
          </div>

          {/* Fragment display */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={handleTap}
          >
            {/* Previous fragment */}
            {prevFragment && (
              <motion.div
                key={`prev-${prevFragment.id}`}
                animate={{ x: -80, scale: 0.7, opacity: 0.3, rotateY: 15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute"
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              >
                <FragmentCard fragment={prevFragment} />
              </motion.div>
            )}

            {/* Current fragment */}
            {currentFragment && (
              <motion.div
                key={currentFragment.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 md:absolute md:inset-0"
              >
                <FragmentCard fragment={currentFragment} isActive />
                {/* Peak phase: glowing pulse behind the anchor fragment */}
                {phase === "peak" && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 -z-10 rounded-3xl blur-2xl"
                    style={{
                      background: "radial-gradient(circle, rgba(147,51,234,0.6) 0%, transparent 70%)",
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* Next fragment */}
            {nextFragment && (
              <motion.div
                key={`next-${nextFragment.id}`}
                animate={{ x: 80, scale: 0.7, opacity: 0.3, rotateY: -15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute"
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              >
                <FragmentCard fragment={nextFragment} />
              </motion.div>
            )}
          </div>

          {/* Opening title */}
          <AnimatePresence>
            {showOpeningTitle && (
              <motion.div
                className="absolute top-20 left-0 right-0 px-8 z-50 pointer-events-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center">
                  <BodySmall
                    style={{
                      color: colors.text.mutedDim,
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "3px",
                      marginBottom: "12px",
                    }}
                  >
                    Now Reliving
                  </BodySmall>
                  <h2
                    style={{
                      color: colors.text.primary,
                      fontSize: "28px",
                      fontFamily: "Playfair Display, serif",
                      textShadow: `0 0 24px ${colors.button.warmGlow}`,
                      lineHeight: "1.2",
                    }}
                  >
                    {experience.title}
                  </h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play/pause chip */}
          <motion.div
            className="absolute top-8 right-6 z-30 pointer-events-none"
            animate={{ opacity: isPaused ? 0.9 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="flex items-center gap-2 rounded-full border backdrop-blur-xl px-3 py-1"
              style={{
                background: "rgba(0,0,0,0.25)",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <BodySmall style={{ color: colors.text.muted, fontSize: "11px" }}>
                {isPaused ? "Paused" : "Playing"}
              </BodySmall>
            </div>
          </motion.div>

          {/* Hint overlay */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="absolute bottom-20 left-0 right-0 px-8 flex justify-center z-30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-full border backdrop-blur-xl px-5 py-2"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    borderColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  <BodySmall style={{ color: colors.text.muted, textAlign: "center" }}>
                    Tap left / right to move · Tap center to pause
                  </BodySmall>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Caption + progress dots */}
          <AnimatePresence>
            {shouldShowCaption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-32 left-0 right-0 px-4 z-30"
              >
                <div
                  className="mx-auto mb-4 rounded-2xl border backdrop-blur-xl px-4 py-3 max-w-60 md:max-w-90"
                  style={{
                    background: colors.surface.glass,
                    borderColor: colors.button.warmBorder,
                  }}
                >
                  {displayDate && (
                    <BodySmall
                      style={{
                        color: colors.text.muted,
                        fontSize: "12px",
                        textAlign: "center",
                        marginBottom: "4px",
                      }}
                    >
                      {experience.title} ·{" "}
                      {new Date(displayDate + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </BodySmall>
                  )}
                  <BodySmall
                    style={{
                      color: colors.text.primary,
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    {currentFragment?.caption}
                  </BodySmall>
                </div>

                {/* Progress dots (context phase only) */}
                {phase === "context" && contextFragments.length > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    {contextFragments.map((_, index) => (
                      <div
                        key={index}
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: index === contextIndex ? "24px" : "8px",
                          background:
                            index === contextIndex
                              ? colors.text.primary
                              : "rgba(255,255,255,0.3)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function PhaseSteps({ currentPhase }: { currentPhase: Phase }) {
  return (
    <div
      className="flex items-center gap-1 px-4 py-2 rounded-full backdrop-blur-xl"
      style={{
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {PHASE_ORDER.map((p, i) => {
        const isActive = p === currentPhase;
        const isPast = PHASE_ORDER.indexOf(currentPhase) > PHASE_ORDER.indexOf(p);
        return (
          <div key={p} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className="w-4 h-px"
                style={{
                  background: isPast || isActive
                    ? "rgba(200,150,220,0.5)"
                    : "rgba(255,255,255,0.15)",
                }}
              />
            )}
            <BodySmall
              style={{
                fontSize: "11px",
                color: isActive
                  ? colors.text.primary
                  : isPast
                    ? "rgba(200,150,220,0.6)"
                    : "rgba(255,255,255,0.25)",
                fontWeight: isActive ? "600" : "400",
                transition: "all 0.3s",
              }}
            >
              {PHASE_LABELS[p]}
            </BodySmall>
          </div>
        );
      })}
    </div>
  );
}

function FragmentCard({
  fragment,
  isActive = false,
}: {
  fragment: ReliveFragment;
  isActive?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border backdrop-blur-xl w-60 h-90 md:w-full md:h-full md:rounded-none md:border-0"
      style={{
        background: colors.surface.glass,
        borderColor: isActive ? colors.button.warmBorder : "rgba(255,255,255,0.1)",
        boxShadow: isActive
          ? `0 0 40px ${colors.button.warmGlow}`
          : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {fragment.type === "text" ? (
        <div className="flex items-center justify-center h-full p-8">
          <Body
            style={{
              color: colors.text.primary,
              fontStyle: "italic",
              textAlign: "center",
              fontSize: "20px",
              lineHeight: "1.6",
            }}
          >
            {fragment.text_context ?? fragment.caption}
          </Body>
        </div>
      ) : fragment.signedUrl ? (
        <img
          src={fragment.signedUrl}
          alt={fragment.caption ?? "Fragment"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Body style={{ color: colors.text.mutedDim }}>{fragment.type}</Body>
        </div>
      )}

      {/* Radial vignette — darkens all edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      {/* Top + bottom gradient — keeps controls and captions legible */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}
