import { useEffect, useMemo, useState } from 'react';
import type { Fragment } from '../types/fragment';
import { getFragmentSignedUrl } from '../lib/storage';

interface FragmentGalleryProps {
  fragments: Fragment[];
}

export default function FragmentGallery({ fragments }: FragmentGalleryProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const signedUrlTargets = useMemo(
    () =>
      fragments.map((fragment) => ({
        id: fragment.id,
        experienceId: fragment.experience_id,
        storagePath: fragment.storage_path,
      })),
    [fragments],
  );
  const signedUrlRequestKey = JSON.stringify(signedUrlTargets);

  useEffect(() => {
    let cancelled = false;

    const currentTargets: Array<{
      id: string;
      experienceId: string;
      storagePath: string | null;
    }> = JSON.parse(signedUrlRequestKey);

    async function loadSignedUrls() {
      const urlEntries = await Promise.all(
        currentTargets.map(async (fragment) => {
          if (!fragment.storagePath) return [fragment.id, null] as const;
          const signedUrl = await getFragmentSignedUrl(
            fragment.experienceId,
            fragment.id,
          );
          return [fragment.id, signedUrl] as const;
        }),
      );

      if (cancelled) return;

      setSignedUrls(
        Object.fromEntries(
          urlEntries.filter((entry): entry is readonly [string, string] => !!entry[1]),
        ),
      );
    }

    void loadSignedUrls();

    return () => {
      cancelled = true;
    };
  }, [signedUrlRequestKey]);

  if (fragments.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {fragments.map((f) => (
        <div key={f.id} className="space-y-1">
          {signedUrls[f.id] ? (
            <img
              src={signedUrls[f.id]}
              alt={f.caption ?? 'Fragment'}
              className="w-full aspect-square rounded-2xl object-cover border backdrop-blur-xl"
              style={{
                borderColor: 'var(--color-button-warm-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            />
          ) : (
            <div
              className="w-full aspect-square rounded-2xl border backdrop-blur-xl flex items-center justify-center text-xs"
              style={{
                background: 'var(--color-surface-glass)',
                borderColor: 'var(--color-surface-glass-card-border)',
                color: 'var(--color-text-muted-dim)',
              }}
            >
              No image
            </div>
          )}
          {f.caption && (
            <p
              className="text-xs truncate"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {f.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
