import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getOneExperience, removeExperience } from "../lib/experience";
import { getFragments, getFragmentSignedUrl } from "../lib/storage";
import {
  deleteReflection,
  getReflections,
  updateReflection,
} from "../lib/reflections";
import type { Experience } from "../types/experience";
import type { Fragment } from "../types/fragment";
import type { Reflection } from "../lib/reflections";
import { colors, effects } from "../design-tokens";
import { H1, H2, Body, BodySmall } from "../components/Typography";
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
    async function loadAll() {
      if (!id) { setLoading(false); return; }
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
        setError("Could not load experience.");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [id]);

  useEffect(() => {
    async function loadCoverImage() {
      if (!experience?.anchor_fragment_id) return;
      try {
        const url = await getFragmentSignedUrl(
          experience.id,
          experience.anchor_fragment_id,
        );
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
        current.map((reflection) =>
          reflection.id === updated.id ? updated : reflection,
        ),
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
        current.filter((reflection) => reflection.id !== reflectionToDelete.id),
      );
      setReflectionToDelete(null);
    } catch (err) {
      console.error(err);
      setReflectionError("Could not delete reflection.");
    } finally {
      setDeletingReflectionId(null);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Body style={{ color: colors.text.muted }}>Loading...</Body>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <Body style={{ color: colors.accent.coral }}>{error}</Body>
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

  return (
    <div className="w-full max-w-[430px] pb-28">

      {/* Back button */}
      <div className="absolute top-8 left-6 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${colors.button.warmBorder}`,
            boxShadow: `0 0 16px ${colors.button.warmGlow}`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 24px ${colors.button.warmGlow}`; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 16px ${colors.button.warmGlow}`; }}
        >
          <ArrowLeft size={20} style={{ color: colors.text.primary }} />
        </button>
      </div>

      {/* Edit + Delete buttons */}
      <div className="absolute top-8 right-6 z-10 flex gap-2">
        <button
          onClick={() => navigate(`/experience/${id}/edit`)}
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${colors.button.warmBorder}`,
            boxShadow: `0 0 16px ${colors.button.warmGlow}`,
          }}
        >
          <Pencil size={16} style={{ color: colors.text.primary }} />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: `1px solid ${colors.button.warmBorder}`,
            boxShadow: `0 0 16px ${colors.button.warmGlow}`,
          }}
        >
          <Trash2 size={16} style={{ color: colors.accent.coral }} />
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div
            className="w-full rounded-2xl border p-6 space-y-4"
            style={{
              background: colors.surface.glassCard,
              borderColor: colors.surface.glassCardBorder,
              boxShadow: effects.shadows.card,
            }}
          >
            <H2>Delete experience?</H2>
            <BodySmall style={{ color: colors.text.muted }}>
              This will permanently delete this experience and all its fragments. This cannot be undone.
            </BodySmall>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-full border py-3 text-sm"
                style={{ borderColor: colors.surface.glassCardBorder, color: colors.text.muted }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="flex-1 rounded-full py-3 text-sm"
                style={{ background: colors.accent.coral, color: "#fff" }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{
              background: colors.surface.glassCard,
              borderColor: colors.surface.glassCardBorder,
              boxShadow: effects.shadows.card,
            }}
          >
            <H2>Edit reflection</H2>
            <textarea
              value={reflectionDraft}
              onChange={(e) => setReflectionDraft(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-[28px] border px-5 py-4 backdrop-blur-xl transition-all duration-300 focus:outline-none"
              style={{
                background: colors.surface.glass,
                borderColor: colors.surface.glassCardBorder,
                color: colors.text.primary,
                lineHeight: "1.6",
              }}
              placeholder="Update your reflection"
            />
            <div className="flex gap-3">
              <button
                onClick={closeEditReflection}
                disabled={savingReflection}
                className="flex-1 rounded-full border py-3 text-sm"
                style={{ borderColor: colors.surface.glassCardBorder, color: colors.text.muted }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSaveReflection()}
                disabled={savingReflection}
                className="flex-1 rounded-full py-3 text-sm"
                style={{ background: colors.button.plumGlassBg, color: colors.text.primary }}
              >
                {savingReflection ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reflectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{
              background: colors.surface.glassCard,
              borderColor: colors.surface.glassCardBorder,
              boxShadow: effects.shadows.card,
            }}
          >
            <H2>Delete reflection?</H2>
            <BodySmall style={{ color: colors.text.muted }}>
              This will permanently remove this saved reflection.
            </BodySmall>
            <div className="flex gap-3">
              <button
                onClick={() => setReflectionToDelete(null)}
                disabled={deletingReflectionId === reflectionToDelete.id}
                className="flex-1 rounded-full border py-3 text-sm"
                style={{ borderColor: colors.surface.glassCardBorder, color: colors.text.muted }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteReflection()}
                disabled={deletingReflectionId === reflectionToDelete.id}
                className="flex-1 rounded-full py-3 text-sm"
                style={{ background: colors.accent.coral, color: "#fff" }}
              >
                {deletingReflectionId === reflectionToDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          {formattedDate && (
            <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>
          )}
          <div className="mt-4">
            <button
              onClick={() => navigate(`/relive/${id}`)}
              className="w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300"
              style={{
                background: colors.button.plumGlassBg,
                borderColor: colors.button.plumGlassBorder,
                boxShadow: isButtonHovered
                  ? `0 4px 16px rgba(0,0,0,0.35), 0 0 25px ${colors.button.plumGlassGlowHover}`
                  : `0 2px 10px rgba(0,0,0,0.35), 0 0 18px ${colors.button.plumGlassGlow}`,
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
            >
              <Body style={{ color: colors.text.primary }}>Relive Experience</Body>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 space-y-4">

        {/* About section */}
        <div
          className="rounded-2xl border backdrop-blur-xl p-5"
          style={{
            background: colors.surface.glassCard,
            borderColor: colors.surface.glassCardBorder,
            boxShadow: effects.shadows.card,
          }}
        >
          <H2 className="mb-2">About this moment</H2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {formattedDate && <BodySmall style={{ color: colors.text.muted }}>{formattedDate}</BodySmall>}
            {experience.location && <BodySmall style={{ color: colors.text.muted }}>· {experience.location}</BodySmall>}
            {experience.is_draft && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: colors.surface.glass, color: colors.text.muted }}>
                Draft
              </span>
            )}
          </div>

          {experience.emotion_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {experience.emotion_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border text-xs backdrop-blur-xl"
                  style={{
                    background: colors.surface.glass,
                    borderColor: colors.surface.glassCardBorder,
                    color: colors.text.primary,
                  }}
                >
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
          style={{
            background: colors.surface.glassCard,
            borderColor: colors.surface.glassCardBorder,
            boxShadow: effects.shadows.card,
          }}
        >
          <H2 className="mb-3">Fragments</H2>
          <FragmentGallery fragments={fragments} />
        </div>

        {/* Reflections section */}
        <div
          className="rounded-2xl border backdrop-blur-xl p-5"
          style={{
            background: colors.surface.glassCard,
            borderColor: colors.surface.glassCardBorder,
            boxShadow: effects.shadows.card,
          }}
        >
          <H2 className="mb-3">Reflections</H2>
          {reflectionError && (
            <BodySmall className="mb-3" style={{ color: colors.accent.coral }}>
              {reflectionError}
            </BodySmall>
          )}
          {reflections.length === 0 ? (
            <BodySmall style={{ color: colors.text.mutedDim }}>No reflections yet.</BodySmall>
          ) : (
            <div className="space-y-3">
              {reflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="rounded-xl border p-4"
                  style={{
                    background: colors.surface.glass,
                    borderColor: colors.surface.glassCardBorder,
                  }}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <BodySmall style={{ color: colors.text.mutedDim, fontSize: "11px" }}>
                      {new Date(reflection.created_at).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </BodySmall>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => openEditReflection(reflection)}
                        className="rounded-full border px-3 py-1.5 text-xs backdrop-blur-xl transition-all duration-200"
                        style={reflectionActionButtonStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setReflectionError("");
                          setReflectionToDelete(reflection);
                        }}
                        disabled={deletingReflectionId === reflection.id}
                        className="rounded-full border px-3 py-1.5 text-xs backdrop-blur-xl transition-all duration-200"
                        style={{
                          ...reflectionActionButtonStyle,
                          color: colors.accent.coral,
                        }}
                      >
                        {deletingReflectionId === reflection.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  <BodySmall style={{ color: colors.text.primary, lineHeight: "1.6" }}>
                    {reflection.content}
                  </BodySmall>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
