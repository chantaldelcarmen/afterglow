import { useState, useCallback, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Plus } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { apiFetch } from '../lib/api';
import { getFragments } from '../lib/storage';
import type { Fragment } from '../types/fragment';
import { H2, BodySmall, Body } from '../components/Typography';
import { AppLogo } from '../components/AppLogo';
import PhotoUpload from '../components/PhotoUpload';
import FragmentGallery from '../components/FragmentGallery';

interface ExperienceData {
  id: string;
  title: string;
  experience_date: string | null;
  location: string | null;
  description: string | null;
}

export default function Upload() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const experienceId = searchParams.get('experienceId');

  const [experience, setExperience] = useState<ExperienceData | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        await loadFragments(experienceId!);
      } catch {
        setError('Failed to load experience');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [experienceId, user, loadFragments]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <BodySmall style={{ color: 'var(--color-text-muted-dim)' }}>Loading...</BodySmall>
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
  if (!experienceId) return <Navigate to="/" replace />;

  return (
    <div className="max-w-175 mx-auto h-full flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-20 pb-2 px-6">
        <AppLogo />
        <H2 className="px-1 text-center">Add Fragments</H2>
        <BodySmall
          className="px-1 mt-1 text-center"
          style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic', fontSize: '13px' }}
        >
          Building your memory
        </BodySmall>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 z-20 pb-4 px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex w-10 h-10 rounded-full items-center justify-center backdrop-blur-xl transition-all duration-300 mb-4 border"
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderColor: 'var(--color-button-warm-border)',
            boxShadow: '0 0 16px var(--color-button-warm-glow)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 24px var(--color-button-warm-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 16px var(--color-button-warm-glow)';
          }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <H2 className="px-1">Add Fragments</H2>
        <BodySmall
          className="px-1 mt-1"
          style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic', fontSize: '13px' }}
        >
          Building your memory
        </BodySmall>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-0">
        {/* Instructional text */}
        <div className="text-center mb-4 mt-2">
          <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontSize: '12px' }}>
            <span className="md:hidden">Tap + to add fragments</span>
            <span className="hidden md:inline">Add photos to build your memory</span>
          </BodySmall>
        </div>

        {/* Glass card -- experience metadata */}
        <div
          className="max-w-sm mx-auto rounded-[28px] border backdrop-blur-xl px-5 py-4 mb-6"
          style={{
            background: 'var(--color-surface-glass-card)',
            borderColor: 'var(--color-surface-glass-card-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="text-center">
            {loading ? (
              <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic' }}>
                Loading experience...
              </BodySmall>
            ) : experience ? (
              <>
                <H2 style={{ marginBottom: '2px' }}>{experience.title}</H2>
                {experience.experience_date && (
                  <BodySmall style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(experience.experience_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </BodySmall>
                )}
                {experience.location && (
                  <BodySmall style={{ color: 'var(--color-text-muted)' }}>
                    {experience.location}
                  </BodySmall>
                )}
                {experience.description && (
                  <BodySmall
                    style={{
                      color: 'var(--color-text-muted-dim)',
                      fontStyle: 'italic',
                      fontSize: '12px',
                      marginTop: '8px',
                    }}
                  >
                    {experience.description}
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

        {/* Desktop add button */}
        <div className="hidden md:flex justify-center mb-6">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="w-14 h-14 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: 'var(--color-button-plum-bg)',
              borderColor: 'var(--color-button-plum-border)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)',
            }}
            onMouseEnter={(e) => {
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
            <Camera size={24} style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </div>

        {/* PhotoUpload (shown when triggered) */}
        {showUpload && (
          <div className="max-w-sm mx-auto mb-6">
            <PhotoUpload
              experienceId={experienceId}
              onUploaded={() => {
                loadFragments(experienceId);
                setShowUpload(false);
              }}
            />
          </div>
        )}

        {error && (
          <p className="text-center text-sm mb-4" style={{ color: 'var(--color-accent-coral)' }}>
            {error}
          </p>
        )}

        {/* Fragment list */}
        <div className="max-w-sm mx-auto mb-6">
          {!loading && fragments.length === 0 ? (
            <div className="text-center py-8">
              <BodySmall style={{ color: 'var(--color-text-muted-dim)', fontStyle: 'italic', fontSize: '13px' }}>
                No fragments yet
              </BodySmall>
            </div>
          ) : (
            <FragmentGallery fragments={fragments} />
          )}
        </div>

        {/* Cancel and Done buttons */}
        <div className="flex justify-center gap-3 pt-4 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-full border backdrop-blur-xl transition-all duration-300"
            style={{
              background: 'var(--color-surface-glass)',
              borderColor: 'var(--color-button-warm-border)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.25), 0 0 12px rgba(246,237,227,0.20)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 2px 10px rgba(0,0,0,0.25), 0 0 18px rgba(246,237,227,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 2px 10px rgba(0,0,0,0.25), 0 0 12px rgba(246,237,227,0.20)';
            }}
          >
            <Body style={{ color: 'var(--color-text-muted)' }}>Cancel</Body>
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-full border backdrop-blur-xl transition-all duration-300"
            style={{
              background: 'var(--color-button-plum-bg)',
              borderColor: 'var(--color-button-plum-border)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)',
            }}
            onMouseEnter={(e) => {
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

      {/* Mobile FAB (+ button) */}
      <button
        onClick={() => setShowUpload(!showUpload)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full border backdrop-blur-xl flex items-center justify-center z-30 transition-all duration-300"
        style={{
          background: 'var(--color-button-plum-bg)',
          borderColor: 'var(--color-button-plum-border)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 20px var(--color-button-plum-glow)',
        }}
      >
        <Plus size={28} style={{ color: 'var(--color-text-primary)' }} />
      </button>
    </div>
  );
}
