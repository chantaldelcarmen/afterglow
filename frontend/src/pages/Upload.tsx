import { useState, useCallback, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { createExperience, getUserExperiences } from '../lib/experience';
import { getFragments } from '../lib/storage';
import type { Fragment } from '../types/fragment';
import type { Experience } from '../types/experience';
import PhotoUpload from '../components/PhotoUpload';
import FragmentGallery from '../components/FragmentGallery';

export default function Upload() {
  const { user, loading } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(false);
  const [fragments, setFragments] = useState<Fragment[]>([]);

  const loadExperiences = useCallback(async () => {
    if (!user) return;
    setIsLoadingExperiences(true);
    try {
      setError(null);
      const data = await getUserExperiences();
      setExperiences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experiences');
    } finally {
      setIsLoadingExperiences(false);
    }
  }, [user]);

  const loadFragments = useCallback(async (expId: string) => {
    try {
      const data = await getFragments(expId);
      setFragments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fragments');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadExperiences();
  }, [user, loadExperiences]);

  async function handleCreate() {
    if (!user || !newTitle.trim()) return;
    try {
      setError(null);
      const { id } = await createExperience(newTitle.trim());
      setNewTitle('');
      await loadExperiences();
      setSelectedId(id);
      await loadFragments(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experience');
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="mx-auto max-w-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upload Photo</h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">Home</Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Select Experience</h2>

        <select
          value={selectedId}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedId(id);
            if (id) loadFragments(id);
            else setFragments([]);
          }}
          disabled={isLoadingExperiences}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">
            {isLoadingExperiences ? 'Loading experiences...' : '-- Choose an experience --'}
          </option>
          {experiences.map((exp) => (
            <option key={exp.id} value={exp.id}>{exp.title}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New experience title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim()}
            className="rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {selectedId && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Photo</h2>
          <PhotoUpload
            experienceId={selectedId}
            onUploaded={() => {
              loadExperiences();
              loadFragments(selectedId);
            }}
          />
        </section>
      )}

      {selectedId && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Uploaded Fragments</h2>
          <FragmentGallery fragments={fragments} />
        </section>
      )}
    </div>
  );
}
