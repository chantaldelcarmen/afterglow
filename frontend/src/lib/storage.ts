import type { Fragment } from '../types/fragment';

const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function uploadFragmentFile(
  file: File,
  experienceId: string,
  fragmentId: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  // Stub: returns a local object URL for preview
  const publicUrl = URL.createObjectURL(file);
  const ext = file.name.split('.').pop() ?? 'bin';
  const storagePath = `${TEMP_USER_ID}/${experienceId}/${fragmentId}.${ext}`;
  return { storagePath, publicUrl };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteFragmentFile(storagePath: string): Promise<void> {
  // Stub: no-op until Supabase Storage is wired
}

export function buildFragment(
  experienceId: string,
  fragmentId: string,
  file: File,
  storagePath: string,
  publicUrl: string,
  caption: string | null,
): Fragment {
  return {
    id: fragmentId,
    experience_id: experienceId,
    user_id: TEMP_USER_ID,
    type: 'photo',
    storage_path: storagePath,
    storage_url: publicUrl,
    caption,
    content: null,
    is_anchor: false,
    file_size: file.size,
    mime_type: file.type,
    created_at: new Date().toISOString(),
  };
}
