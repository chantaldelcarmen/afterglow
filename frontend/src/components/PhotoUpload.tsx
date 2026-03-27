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
        className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
      />

      {preview && (
        <img src={preview} alt="Preview" className="max-h-48 rounded object-contain" />
      )}

      <input
        type="text"
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={isUploading}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Upload Photo'}
      </button>

      {progress.status === 'done' && (
        <p className="text-sm text-green-600">Photo uploaded successfully.</p>
      )}
      {progress.status === 'error' && (
        <p className="text-sm text-red-600">{progress.error}</p>
      )}
    </div>
  );
}
