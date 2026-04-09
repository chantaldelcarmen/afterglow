import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getOneExperience, removeExperience } from "../lib/experience";
import { getFragments, getFragmentSignedUrl } from "../lib/storage";
import { deleteReflection, getReflections, updateReflection } from "../lib/reflections";
import type { Experience } from "../types/experience";
import type { Fragment } from "../types/fragment";
import type { Reflection } from "../lib/reflections";
import { colors, effects } from "../design-tokens";
import { H1, H2, Body, BodySmall } from "../components/Typography";
import { LoadingScreen } from "../components/LoadingScreen";
import { ImageOverlay } from "../components/ImageOverlay";
import { GlowOverlay } from "../components/GlowOverlay";
import FragmentGallery from "../components/FragmentGallery";

export default function ExperienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reflectionError, setReflectionError] = useState("");
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(null);
  const [reflectionDraft, setReflectionDraft] = useState("");
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionToDelete, setReflectionToDelete] = useState<Reflection | null>(null);
  const [deletingReflectionId, setDeletingReflectionId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  const loadAll = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const [data, frags, refs] = await Promise.all([
        getOneExperience(id),
        getFragments(id),
        getReflections(id),
      ]);
      setExperience(data);
      setFragments(frags);
      setReflections(refs);
    } catch (err) {
      console.error(err);
      setError("Couldn't load this experience. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    async function loadCoverImage() {
      if (!experience?.anchor_fragment_id) return;
      try {
        const url = await getFragmentSignedUrl(experience.id, experience.anchor_fragment_id);
        setCoverImage(url);
      } catch (err) {
        console.error(err);
        setCoverImage(null);
      }
    }
    void loadCoverImage();
  }, [experience?.id, experience?.anchor_fragment_id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await removeExperience(id);
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError("Could not delete experience.");
      setDeleting(false);
    }
  }

  function openEditReflection(reflection: Reflection) {
    setReflectionError("");
    setEditingReflection(reflection);
    setReflectionDraft(reflection.content);
  }

  function closeEditReflection() {
    if (savingReflection) return;
    setEditingReflection(null);
    setReflectionDraft("");
  }

  async function handleSaveReflection() {
    if (!id || !editingReflection) return;
    const nextContent = reflectionDraft.trim();
    if (!nextContent) {
      setReflectionError("Reflection text cannot be empty.");
      return;
    }
    setSavingReflection(true);
    setReflectionError("");
    try {
      const updated = await updateReflection(id, editingReflection.id, nextContent);
      setReflections((current) =>
        current.map((r) => r.id === updated.id ? updated : r)
      );
      setEditingReflection(null);
      setReflectionDraft("");
    } catch (err) {
      console.error(err);
      setReflectionError("Could not update reflection.");
    } finally {
      setSavingReflection(false);
    }
  }

  async function handleDeleteReflection() {
    if (!id || !reflectionToDelete) return;
    setDeletingReflectionId(reflectionToDelete.id);
    setReflectionError("");
    try {
      await deleteReflection(id, reflectionToDelete.id);
      setReflections((current) =>
        current.filter((r) => r.id !== reflectionToDelete.id)
      );
      setReflectionToDelete(null);
    } catch (err) {
      console.error(err);
      setReflectionError("Could not delete reflection.");
    } finally {
      setDeletingReflectionId(null);
    }
  }

  if (loading) return <LoadingScreen />;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
      <Body style={{ color: colors.accent.coral }}>{error}</Body>
      <BodySmall style={{ color: colors.text.muted }}>
        <button
          onClick={() => void loadAll()}
          style={{ textDecoration: "underline" }}
        >
          Try again
        </button>
        {" or "}
        <button
          onClick={() => navigate("/library")}
          style={{ textDecoration: "underline" }}
        >
          Go back to library
        </button>
      </BodySmall>
    </div>
  );

  if (!experience) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <Body style={{ color: colors.text.muted }}>Experience not found.</Body>
        <Link to="/library" style={{ color: colors.text.muted }}>Back to library</Link>
      </div>
    </div>
  );

  const displayDate = experience.experience_date ?? experience.start_date ?? null;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    })
    : null;

  const reflectionActionButtonStyle = {
    background: colors.surface.glass,
    borderColor: colors.surface.glassCardBorder,
    color: colors.text.muted,
  };

  const iconBtnStyle = {
    background: "rgba(0,0,0,0.35)",
    border: `1px solid ${colors.surface.glassCardBorder}`,
    boxShadow: `0 0 12px ${colors.button.warmGlow}`,
  };

  const reliveButtonStyle = {
    background: colors.button.plumGlassBg,
    borderColor: colors.button.plumGlassBorder,
    boxShadow: isButtonHovered
      ? `0 4px 16px rgba(0,0,0,0.35), 0 0 25px ${colors.button.plumGlassGlowHover}`
      : `0 2px 10px rgba(0,0,0,0.35), 0 0 18px ${colors.button.plumGlassGlow}`,
  };

  const contentSections = (
    <>
      {/* About section */}
      <div
        className="rounded-2xl border backdrop-blur-xl p-5"
        style={{ background: colors.surface.glassCard, borderColor: colors.surface.glassCardBorder, boxShadow: effects.shadows.card }}
      >
        <H2 className="mb-2">About this moment</H2>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {formattedDate && <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>}
          {experience.location && <BodySmall style={{ color: colors.text.muted }}>· {experience.location}</BodySmall>}
          {experience.is_draft && (
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: colors.surface.glass, color: colors.text.muted }}>Draft</span>
          )}
        </div>
        {experience.emotion_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {experience.emotion_tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full border text-xs backdrop-blur-xl" style={{ background: colors.surface.glass, borderColor: colors.surface.glassCardBorder, color: colors.text.primary }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <BodySmall style={{ color: colors.text.mutedDim, fontSize: "13px", lineHeight: "1.6" }}>
          {experience.description || "No description yet."}
        </BodySmall>
      </div>

      {/* Fragments section */}
      <div
        className="rounded-2xl border backdrop-blur-xl p-5"
        style={{ background: colors.surface.glassCard, borderColor: colors.surface.glassCardBorder, boxShadow: effects.shadows.card }}
      >
        <H2 className="mb-3">Fragments</H2>
        <FragmentGallery fragments={fragments} />
      </div>

      {/* Reflections section */}
      <div
        className="rounded-2xl border backdrop-blur-xl p-5"
        style={{ background: colors.surface.glassCard, borderColor: colors.surface.glassCardBorder, boxShadow: effects.shadows.card }}
      >
        <H2 className="mb-3">Reflections</H2>
        {reflectionError && <BodySmall className="mb-3" style={{ color: colors.accent.coral }}>{reflectionError}</BodySmall>}
        {reflections.length === 0 ? (
          <BodySmall style={{ color: colors.text.mutedDim }}>No reflections yet.</BodySmall>
        ) : (
          <div className="space-y-3">1
            {reflections.map((reflection) => (
              <div key={reflection.id} className="rounded-xl border p-4" style={{ background: colors.surface.glass, borderColor: colors.surface.glassCardBorder }}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <BodySmall style={{ color: colors.text.mutedDim, fontSize: "11px" }}>
                    {new Date(reflection.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </BodySmall>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => openEditReflection(reflection)} className="rounded-full border px-3 py-1.5 text-xs backdrop-blur-xl transition-all duration-200" style={reflectionActionButtonStyle}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorderHover; e.currentTarget.style.color = colors.text.primary; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorder; e.currentTarget.style.color = colors.text.muted; }}
                    >Edit</button>
                    <button onClick={() => { setReflectionError(""); setReflectionToDelete(reflection); }} disabled={deletingReflectionId === reflection.id} className="rounded-full border px-3 py-1.5 text-xs backdrop-blur-xl transition-all duration-200" style={{ ...reflectionActionButtonStyle, color: colors.accent.coral }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      {deletingReflectionId === reflection.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <BodySmall style={{ color: colors.text.primary, lineHeight: "1.6" }}>{reflection.content}</BodySmall>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      className="relative w-full pb-28 md:pb-0 transition-all duration-700"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
      }}
    >

      {/* Modals -- fixed, work on both layouts */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4" style={{ background: colors.surface.glassCard, borderColor: colors.surface.glassCardBorder, boxShadow: effects.shadows.card }}>
            <H2>Delete experience?</H2>
            <BodySmall style={{ color: colors.text.muted }}>This will permanently delete this experience and all its fragments. This cannot be undone.</BodySmall>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-full border py-3 text-sm" style={{ borderColor: colors.surface.glassCardBorder, color: colors.text.muted }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorderHover; e.currentTarget.style.color = colors.text.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorder; e.currentTarget.style.color = colors.text.muted; }}
              >Cancel</button>
              <button onClick={() => void handleDelete()} disabled={deleting} className="flex-1 rounded-full py-3 text-sm" style={{ background: colors.accent.coral, color: "#fff" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4" style={{ background: colors.surface.glassCard, borderColor: colors.surface.glassCardBorder, boxShadow: effects.shadows.card }}>
            <H2>Edit reflection</H2>
            <textarea
              value={reflectionDraft}
              onChange={(e) => setReflectionDraft(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-[28px] border px-5 py-4 backdrop-blur-xl transition-all duration-300 focus:outline-none"
              style={{ background: colors.surface.glass, borderColor: colors.surface.glassCardBorder, color: colors.text.primary, lineHeight: "1.6" }}
              placeholder="Update your reflection"
            />
            <div className="flex gap-3">
              <button onClick={closeEditReflection} disabled={savingReflection} className="flex-1 rounded-full border py-3 text-sm transition-all duration-200" style={{ borderColor: colors.surface.glassCardBorder, color: colors.text.muted }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorderHover; e.currentTarget.style.color = colors.text.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorder; e.currentTarget.style.color = colors.text.muted; }}
              >Cancel</button>
              <button onClick={() => void handleSaveReflection()} disabled={savingReflection} className="flex-1 rounded-full py-3 text-sm transition-all duration-200" style={{ background: colors.button.plumGlassBg, color: colors.text.primary }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.button.plumGlassBgHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = colors.button.plumGlassBg; }}
              >
                {savingReflection ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reflectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4" style={{ background: colors.surface.glassCard, borderColor: colors.surface.glassCardBorder, boxShadow: effects.shadows.card }}>
            <H2>Delete reflection?</H2>
            <BodySmall style={{ color: colors.text.muted }}>This will permanently remove this saved reflection.</BodySmall>
            <div className="flex gap-3">
              <button onClick={() => setReflectionToDelete(null)} disabled={deletingReflectionId === reflectionToDelete.id} className="flex-1 rounded-full border py-3 text-sm transition-all duration-200" style={{ borderColor: colors.surface.glassCardBorder, color: colors.text.muted }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorderHover; e.currentTarget.style.color = colors.text.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.surface.glassCardBorder; e.currentTarget.style.color = colors.text.muted; }}
              >Cancel</button>
              <button onClick={() => void handleDeleteReflection()} disabled={deletingReflectionId === reflectionToDelete.id} className="flex-1 rounded-full py-3 text-sm transition-all duration-200" style={{ background: colors.accent.coral, color: "#fff" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {deletingReflectionId === reflectionToDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden">
        {/* Buttons overlaid on hero */}
        <div className="absolute top-8 left-0 right-0 z-10 flex justify-between px-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300" style={iconBtnStyle} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 18px ${colors.button.warmGlow}`; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 12px ${colors.button.warmGlow}`; }}>
            <ArrowLeft size={20} style={{ color: colors.text.primary }} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/experience/${id}/edit`)} className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300" style={iconBtnStyle}>
              <Pencil size={16} style={{ color: colors.text.primary }} />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300" style={iconBtnStyle}>
              <Trash2 size={16} style={{ color: colors.accent.coral }} />
            </button>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative h-[336px] overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt={experience.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: colors.surface.glassCard }} />
          )}
          <ImageOverlay />
          <GlowOverlay />
          <div className="absolute bottom-8 left-6 right-6">
            <H1 className="mb-2">{experience.title}</H1>
            {formattedDate && <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>}
            <div className="mt-4">
              <button onClick={() => navigate(`/relive/${id}`)} className="w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300" style={reliveButtonStyle} onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)}>
                <Body style={{ color: colors.text.primary }}>Relive Experience</Body>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 space-y-4">{contentSections}</div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block px-8 pt-8 pb-12">
        {/* Buttons row */}
        <div className="flex justify-between mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300" style={iconBtnStyle} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 18px ${colors.button.warmGlow}`; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 12px ${colors.button.warmGlow}`; }}>
            <ArrowLeft size={20} style={{ color: colors.text.primary }} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/experience/${id}/edit`)} className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300" style={iconBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 18px ${colors.button.warmGlow}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 12px ${colors.button.warmGlow}`; }}
            >
              <Pencil size={16} style={{ color: colors.text.primary }} />
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300" style={iconBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 18px rgba(229,118,120,0.4)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 12px ${colors.button.warmGlow}`; }}
            >
              <Trash2 size={16} style={{ color: colors.accent.coral }} />
            </button>
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-8 min-h-[600px]">
          {/* Left: sticky anchor image */}
          <div
            className="relative overflow-hidden rounded-3xl border backdrop-blur-xl sticky top-8 h-[calc(100vh-120px)]"
            style={{ background: colors.surface.glassCard, borderColor: colors.surface.glassCardBorder, boxShadow: effects.shadows.card }}
          >
            {coverImage ? (
              <img src={coverImage} alt={experience.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: colors.surface.glassCard }} />
            )}
            <ImageOverlay />
            <GlowOverlay />
          </div>

          {/* Right: scrollable content */}
          <div className="space-y-6">
            <div>
              <H1 className="mb-1">{experience.title}</H1>
              {formattedDate && <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>}
            </div>
            <button onClick={() => navigate(`/relive/${id}`)} className="w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300" style={reliveButtonStyle} onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)}>
              <Body style={{ color: colors.text.primary }}>Relive Experience</Body>
            </button>
            {contentSections}
          </div>
        </div>
      </div>
    </div>
  );
}
