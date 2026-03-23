import { useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { createExperience, getUserExperiences } from '../lib/experience';
import PhotoUpload from '../components/PhotoUpload';

interface Experience {
  id: string;
  title: string;
  created_at: string;
}

export default function Upload() {
  const { user, loading } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadExperiences = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserExperiences(user.id);
      setExperiences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experiences');
    }
  }, [user]);

  if (user && !loaded) {
    setLoaded(true);
    loadExperiences();
  }

  async function handleCreate() {
    if (!user || !newTitle.trim()) return;
    try {
      setError(null);
      const { id } = await createExperience(newTitle.trim(), user.id);
      setNewTitle('');
      await loadExperiences();
      setSelectedId(id);
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
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- Choose an experience --</option>
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
            userId={user.id}
            onUploaded={loadExperiences}
          />
        </section>
      )}
    </div>
  );
}
