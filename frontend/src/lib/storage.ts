import supabase from '../utils/supabase';
import type { Fragment, FragmentInsert } from '../types/fragment';

const BUCKET = 'fragments';

export async function uploadFragmentFile(
  file: File,
  userId: string,
  experienceId: string,
  fragmentId: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const storagePath = `${userId}/${experienceId}/${fragmentId}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

export async function deleteFragmentFile(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);
  if (error) throw error;
}

export async function saveFragmentMetadata(
  fragment: FragmentInsert,
): Promise<void> {
  const { error } = await supabase.from('fragments').insert(fragment);
  if (error) throw error;
}

export async function getFragmentsByExperience(
  experienceId: string,
): Promise<Fragment[]> {
  const { data, error } = await supabase
    .from('fragments')
    .select('id, experience_id, type, caption, storage_path, text_context, created_at')
    .eq('experience_id', experienceId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function getFragmentPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
