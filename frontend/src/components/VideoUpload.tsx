import { useEffect, useRef, useState } from 'react';
import { Video } from 'lucide-react';
import type { UploadProgress } from '../types/fragment';
import { uploadFragment } from '../lib/storage';
import { validateVideoFile } from '../lib/validation';

interface VideoUploadProps {
  experienceId: string;
  onUploaded?: () => void;
  onCancel?: () => void;
}

export default function VideoUpload({
  experienceId,
  onUploaded,
  onCancel,
}: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState<UploadProgress>({
    status: 'idle',
    error: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const nextPreview = selected ? URL.createObjectURL(selected) : null;
    previewRef.current = nextPreview;
    setFile(selected);
    setPreview(nextPreview);
    setProgress({ status: 'idle', error: null });

    if (!selected) {
      setCaption('');
    }
  }

  function clearSelection() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setFile(null);
    setPreview(null);
    setCaption('');
    setProgress({ status: 'idle', error: null });
    if (inputRef.current) inputRef.current.value = '';
    onCancel?.();
  }

  async function handleUpload() {
    if (!file) return;

    setProgress({ status: 'validating', error: null });
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setProgress({ status: 'error', error: validation.error });
      return;
    }

    try {
      setProgress({ status: 'uploading', error: null });
      await uploadFragment(experienceId, file, caption.trim() || undefined);

      setProgress({ status: 'done', error: null });
      previewRef.current = null;
      setFile(null);
      setPreview(null);
      setCaption('');
      if (inputRef.current) inputRef.current.value = '';
      onUploaded?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setProgress({ status: 'error', error: message });
    }
  }

  const isUploading = progress.status === 'uploading';

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {!file && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-[28px] border border-dashed px-5 py-8 text-center backdrop-blur-xl transition-all duration-300"
          style={{
            background: 'var(--color-surface-glass-card)',
            borderColor: 'var(--color-button-warm-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border"
            style={{
              borderColor: 'var(--color-button-warm-border)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <Video size={20} style={{ color: 'var(--color-text-primary)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Tap to choose video
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted-dim)' }}>
            MP4, WebM, or MOV up to 25 MB
          </p>
        </button>
      )}

      {file && (
        <>
          <video
            src={preview ?? undefined}
            controls
            muted
            playsInline
            preload="metadata"
            className="max-h-56 w-full rounded-[28px] object-cover border"
            style={{ borderColor: 'var(--color-surface-glass-card-border)' }}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full border px-4 py-2 text-sm backdrop-blur-xl transition-all duration-300"
              style={{
                background: 'var(--color-surface-glass)',
                borderColor: 'var(--color-button-warm-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              Choose another
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="rounded-full border px-4 py-2 text-sm backdrop-blur-xl transition-all duration-300"
              style={{
                background: 'var(--color-surface-glass)',
                borderColor: 'var(--color-surface-glass-card-border)',
                color: 'var(--color-text-muted-dim)',
              }}
            >
              Clear
            </button>
          </div>

          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-3 rounded-[28px] border backdrop-blur-xl transition-all duration-300 focus:outline-none text-sm"
            style={{
              background: 'var(--color-surface-glass-card)',
              borderColor: 'var(--color-surface-glass-card-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-surface-glass-card-border-hover)';
              e.currentTarget.style.boxShadow = '0 0 20px var(--color-button-warm-glow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-surface-glass-card-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={!file || isUploading}
            className="w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{
              background: 'var(--color-button-plum-bg)',
              borderColor: 'var(--color-button-plum-border)',
              color: 'var(--color-text-primary)',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-button-plum-bg-hover)';
              e.currentTarget.style.boxShadow =
                '0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-button-plum-bg)';
              e.currentTarget.style.boxShadow =
                '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)';
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </>
      )}

      {progress.status === 'error' && (
        <p className="text-sm text-center" style={{ color: 'var(--color-accent-coral)' }}>
          {progress.error}
        </p>
      )}
    </div>
  );
}
