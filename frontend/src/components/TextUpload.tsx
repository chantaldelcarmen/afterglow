import { useState } from 'react';
import { Type } from 'lucide-react';
import { uploadTextFragment } from '../lib/storage';
import type { UploadProgress } from '../types/fragment';

interface TextUploadProps {
  experienceId: string;
  onUploaded?: () => void;
  onCancel?: () => void;
}

export default function TextUpload({
  experienceId,
  onUploaded,
  onCancel,
}: TextUploadProps) {
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState<UploadProgress>({
    status: 'idle',
    error: null,
  });

  const isUploading = progress.status === 'uploading';
  const trimmedText = text.trim();
  const hasContent = trimmedText.length > 0 || caption.trim().length > 0;

  function clearInputs() {
    setText('');
    setCaption('');
    setProgress({ status: 'idle', error: null });
    onCancel?.();
  }

  async function handleUpload() {
    if (!trimmedText) {
      setProgress({ status: 'error', error: 'Text content is required' });
      return;
    }

    try {
      setProgress({ status: 'uploading', error: null });
      await uploadTextFragment(
        experienceId,
        trimmedText,
        caption.trim() || undefined,
      );
      setProgress({ status: 'done', error: null });
      setText('');
      setCaption('');
      onUploaded?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setProgress({ status: 'error', error: message });
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="w-full rounded-[28px] border border-dashed px-5 py-6 text-center backdrop-blur-xl"
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
          <Type size={20} style={{ color: 'var(--color-text-primary)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Write your text fragment
        </p>
        <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted-dim)' }}>
          Add a note, quote, or memory you want to preserve
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (progress.status === 'error') {
            setProgress({ status: 'idle', error: null });
          }
        }}
        placeholder="Write the memory you want to keep..."
        rows={6}
        disabled={isUploading}
        className="w-full px-4 py-4 rounded-[28px] border backdrop-blur-xl resize-none transition-all duration-300 focus:outline-none text-sm"
        style={{
          background: 'var(--color-surface-glass-card)',
          borderColor: 'var(--color-surface-glass-card-border)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.6',
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

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={clearInputs}
          disabled={!hasContent || isUploading}
          className="rounded-full border px-4 py-2 text-sm backdrop-blur-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--color-surface-glass)',
            borderColor: 'var(--color-surface-glass-card-border)',
            color: 'var(--color-text-muted-dim)',
          }}
        >
          Clear
        </button>

        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={!trimmedText || isUploading}
          className="rounded-full border backdrop-blur-xl px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
          {isUploading ? 'Uploading...' : 'Upload Text'}
        </button>
      </div>

      {progress.status === 'error' && (
        <p className="text-sm text-center" style={{ color: 'var(--color-accent-coral)' }}>
          {progress.error}
        </p>
      )}
    </div>
  );
}
