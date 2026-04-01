import { useState, useRef } from 'react';
import type { UploadProgress } from '../types/fragment';
import { validatePhotoFile } from '../lib/validation';
import { uploadFragment } from '../lib/storage';

interface PhotoUploadProps {
  experienceId: string;
  onUploaded?: () => void;
}

export default function PhotoUpload({ experienceId, onUploaded }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState<UploadProgress>({ status: 'idle', error: null });
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setProgress({ status: 'idle', error: null });
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleUpload() {
    if (!file) return;

    setProgress({ status: 'validating', error: null });
    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      setProgress({ status: 'error', error: validation.error });
      return;
    }

    try {
      setProgress({ status: 'uploading', error: null });
      await uploadFragment(experienceId, file, caption.trim() || undefined);

      setProgress({ status: 'done', error: null });
      setFile(null);
      setCaption('');
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
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
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="max-h-48 rounded-2xl object-contain border"
          style={{ borderColor: 'var(--color-surface-glass-card-border)' }}
        />
      )}

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
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        style={{
          background: 'var(--color-button-plum-bg)',
          borderColor: 'var(--color-button-plum-border)',
          color: 'var(--color-text-primary)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)',
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
        {isUploading ? 'Uploading...' : 'Upload Photo'}
      </button>

      {progress.status === 'done' && (
        <p className="text-sm text-center" style={{ color: 'var(--color-accent-gold)' }}>
          Photo uploaded successfully.
        </p>
      )}
      {progress.status === 'error' && (
        <p className="text-sm text-center" style={{ color: 'var(--color-accent-coral)' }}>
          {progress.error}
        </p>
      )}
    </div>
  );
}
