import { useState, useCallback, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Camera, Video, Type, Anchor } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { useAuth } from '../utils/AuthContext';
import { useFloatingOrb } from '../utils/floatingOrbContext';
import type { FragmentType } from '../utils/floatingOrbContext';
import { apiFetch } from '../lib/api';
import { getFragments, setAnchorFragment } from '../lib/storage';
import type { Fragment } from '../types/fragment';
import { H2, BodySmall, Body } from '../components/Typography';
import { LoadingScreen } from '../components/LoadingScreen';
import { AppLogo } from '../components/AppLogo';
import PhotoUpload from '../components/PhotoUpload';
import VideoUpload from '../components/VideoUpload';
import FragmentGallery from '../components/FragmentGallery';
import { revokePhotoPreviewUrl } from '../utils/photoPreviewUrl';
import { EMPTY_PHOTO_DRAFT, useUploadDraft } from '../utils/uploadDraftContext';

interface ExperienceData {
  id: string;
  title: string;
  experience_date: string | null;
  location: string | null;
  description: string | null;
  anchor_fragment_id: string | null;
}

export default function Upload() {
  const { user, loading: authLoading } = useAuth();
  const { setFragmentTypeCallback, setOrbExpanded } = useFloatingOrb();
  const { photoDraft, setPhotoDraft } = useUploadDraft();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const experienceId = searchParams.get('experienceId');

  const [experience, setExperience] = useState<ExperienceData | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [anchorFragmentId, setAnchorFragmentId] = useState<string | null>(null);
  const [settingAnchorId, setSettingAnchorId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<FragmentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => { clearTimeout(timer); setMounted(false); };
  }, []);

  const hasActivePhotoDraft =
    !!experienceId &&
    photoDraft.experienceId === experienceId &&
    !!photoDraft.file;

  const mobileHelperText =
    selectedType === 'video'
      ? 'Choose a short video to upload'
      : hasActivePhotoDraft
        ? 'Your selected photo is ready to upload'
        : selectedType === 'text'
          ? 'Text fragments are coming soon'
          : 'Tap the camera or video orb to choose a fragment';

  const desktopHelperText =
    selectedType === 'video'
      ? 'Choose a short video to upload'
      : hasActivePhotoDraft
        ? 'Your selected photo is ready to upload'
        : selectedType === 'text'
          ? 'Text fragments are coming soon'
          : 'Choose a fragment type to continue';

  const loadFragments = useCallback(async (expId: string) => {
    try {
      const data = await getFragments(expId);
      setFragments(data);
    } catch {
      setError('Failed to load fragments');
    }
  }, []);

  useEffect(() => {
    if (!experienceId || !user) return;

    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch(`/experiences/${experienceId}`);
        const data = await res.json();
        setExperience(data);
        setAnchorFragmentId(data.anchor_fragment_id ?? null);
        await loadFragments(experienceId!);
      } catch {
        setError('Failed to load experience');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [experienceId, user, loadFragments]);

  useEffect(() => {
    setFragmentTypeCallback(() => (type: FragmentType) => {
      setSelectedType((current) => (current === type ? null : type));
    });

    return () => {
      setFragmentTypeCallback(null);
      setOrbExpanded(false);
    };
  }, [setFragmentTypeCallback, setOrbExpanded]);

  useEffect(() => {
    if (hasActivePhotoDraft) {
      setSelectedType('photo');
    }
  }, [hasActivePhotoDraft]);

  async function handleSetAnchor(fragment: Fragment) {
    if (!experienceId) return;
    setSettingAnchorId(fragment.id);
    setError(null);
    try {
      await setAnchorFragment(experienceId, fragment.id);
      setAnchorFragmentId(fragment.id);
    } catch {
      setError('Could not set anchor fragment.');
    } finally {
      setSettingAnchorId(null);
    }
  }

  function handleCancel() {
    if (hasActivePhotoDraft) {
      revokePhotoPreviewUrl(photoDraft.file);
    }

    setPhotoDraft(EMPTY_PHOTO_DRAFT);
    setSelectedType(null);
    navigate(-1);
  }

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/signin" replace />;
  if (!experienceId) return <Navigate to="/" replace />;

  return (
    <div className="h-full flex flex-col">
      <div
        className="sticky top-0 z-20 px-6 pb-4 pt-4 md:pt-8 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transitionDelay: "50ms",
        }}
      >
        <div className="md:hidden">
          <AppLogo />
        </div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <BackButton onClick={handleCancel} className="shrink-0" />

          <div className="min-w-0 flex-1 text-center">
            <H2 className="px-1 text-center">Add Fragments</H2>
            <BodySmall
              className="px-1 mt-1 text-center"
              style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic', fontSize: '13px' }}
            >
              Building your memory
            </BodySmall>
          </div>

          <button
            type="button"
            disabled={fragments.length > 0 && !anchorFragmentId}
            onClick={() => navigate(`/experience/${experienceId}`)}
            className="shrink-0 rounded-full border px-5 py-2 text-sm backdrop-blur-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-button-plum-bg)',
              borderColor: 'var(--color-button-plum-border)',
              color: 'var(--color-text-primary)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)',
            }}
            onMouseEnter={(e) => {
              if (fragments.length > 0 && !anchorFragmentId) return;
              e.currentTarget.style.background = 'var(--color-button-plum-bg-hover)';
              e.currentTarget.style.borderColor = 'var(--color-button-plum-border-hover)';
              e.currentTarget.style.boxShadow =
                '0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-button-plum-bg)';
              e.currentTarget.style.borderColor = 'var(--color-button-plum-border)';
              e.currentTarget.style.boxShadow =
                '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)';
            }}
          >
            <Body style={{ color: 'var(--color-text-primary)' }}>Done</Body>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-6 pb-36 md:pb-20 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "100ms",
        }}
      >
        {/* Instructional text */}
        <div className="text-center mb-5 mt-2">
          <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontSize: '12px' }}>
            <span className="md:hidden">
              {mobileHelperText}
            </span>
            <span className="hidden md:inline">
              {desktopHelperText}
            </span>
          </BodySmall>
        </div>

        {/* Glass card -- experience metadata */}
        <div
          className="max-w-sm mx-auto rounded-[28px] border backdrop-blur-xl px-5 py-3 mb-5"
          style={{
            background: 'var(--color-surface-glass-card)',
            borderColor: 'var(--color-surface-glass-card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="space-y-1 text-center">
            {loading ? (
              <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic' }}>
                Loading experience...
              </BodySmall>
            ) : experience ? (
              <>
                <Body className="truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {experience.title}
                </Body>
                {experience.experience_date && (
                  <BodySmall style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(experience.experience_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </BodySmall>
                )}
              </>
            ) : (
              <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic' }}>
                No experience metadata
              </BodySmall>
            )}
          </div>
        </div>

        {/* Desktop fragment type buttons */}
        <div className="hidden md:flex justify-center gap-4 mb-5">
          {([
            { type: 'photo' as FragmentType, icon: Camera },
            { type: 'video' as FragmentType, icon: Video },
            { type: 'text' as FragmentType, icon: Type },
          ]).map(({ type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setSelectedType((cur) => (cur === type ? null : type))}
              className="w-14 h-14 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: selectedType === type ? 'var(--color-button-plum-bg-hover)' : 'var(--color-button-plum-bg)',
                borderColor: selectedType === type ? 'var(--color-button-plum-border-hover)' : 'var(--color-button-plum-border)',
                boxShadow: selectedType === type
                  ? '0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)'
                  : '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-button-plum-bg-hover)';
                e.currentTarget.style.borderColor = 'var(--color-button-plum-border-hover)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)';
              }}
              onMouseLeave={(e) => {
                if (selectedType !== type) {
                  e.currentTarget.style.background = 'var(--color-button-plum-bg)';
                  e.currentTarget.style.borderColor = 'var(--color-button-plum-border)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)';
                }
              }}
            >
              <Icon size={24} style={{ color: 'var(--color-text-primary)' }} />
            </button>
          ))}
        </div>

        {/* Fragment upload area (shown when a type is selected) */}
        {selectedType === 'photo' && (
          <div className="max-w-sm mx-auto mb-5">
            <PhotoUpload
              experienceId={experienceId}
              onUploaded={() => {
                loadFragments(experienceId);
                setSelectedType(null);
              }}
              onCancel={() => setSelectedType(null)}
            />
          </div>
        )}
        {selectedType === 'video' && (
          <div className="max-w-sm mx-auto mb-5">
            <VideoUpload
              experienceId={experienceId}
              onUploaded={() => {
                loadFragments(experienceId);
                setSelectedType(null);
              }}
              onCancel={() => setSelectedType(null)}
            />
          </div>
        )}
        {selectedType === 'text' && (
          <div
            className="max-w-sm mx-auto mb-6 rounded-[28px] border backdrop-blur-xl px-5 py-6 text-center"
            style={{
              background: 'var(--color-surface-glass-card)',
              borderColor: 'var(--color-surface-glass-card-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic', fontSize: '13px' }}>
              Text fragments coming soon
            </BodySmall>
          </div>
        )}

        {error && (
          <p className="text-center text-sm mb-4" style={{ color: 'var(--color-accent-coral)' }}>
            {error}
          </p>
        )}

        {/* Fragment list */}
        <div className="max-w-sm mx-auto mb-8">
          {!loading && fragments.length === 0 ? (
            <div className="text-center py-8">
              <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic', fontSize: '13px' }}>
                No fragments yet
              </BodySmall>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <Anchor size={11} style={{ color: 'var(--color-text-muted-dim)', flexShrink: 0 }} />
                <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontSize: '12px' }}>
                  {anchorFragmentId
                    ? 'Peak moment set — tap another fragment to change it'
                    : 'Tap a fragment to set it as the peak moment'}
                </BodySmall>
              </div>
              <FragmentGallery
                fragments={fragments}
                anchorFragmentId={anchorFragmentId}
                onSetAnchor={handleSetAnchor}
                settingAnchorId={settingAnchorId}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
