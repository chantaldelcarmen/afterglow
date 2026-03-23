import type { Fragment } from '../types/fragment';
import { getFragmentPublicUrl } from '../lib/storage';

interface FragmentGalleryProps {
  fragments: Fragment[];
}

export default function FragmentGallery({ fragments }: FragmentGalleryProps) {
  if (fragments.length === 0) {
    return <p className="text-sm text-gray-500">No fragments yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {fragments.map((f) => (
        <div key={f.id} className="space-y-1">
          {f.storage_path ? (
            <img
              src={getFragmentPublicUrl(f.storage_path)}
              alt={f.caption ?? 'Fragment'}
              className="w-full aspect-square rounded object-cover"
            />
          ) : (
            <div className="w-full aspect-square rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
          {f.caption && (
            <p className="text-xs text-gray-600 truncate">{f.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}
