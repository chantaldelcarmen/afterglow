import supabase from '../utils/supabase';
import { apiFetch } from './api';
import type { Fragment } from '../types/fragment';

const BUCKET = 'fragments';

export async function uploadFragment(
  experienceId: string,
  file: File,
  caption?: string,
): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);
  await apiFetch(`/experiences/${experienceId}/fragments`, {
    method: 'POST',
    body: form,
  });
}

export async function getFragments(
  experienceId: string,
): Promise<Fragment[]> {
  const res = await apiFetch(`/experiences/${experienceId}/fragments`);
  return res.json();
}

export async function deleteFragment(
  experienceId: string,
  fragmentId: string,
): Promise<void> {
  await apiFetch(`/experiences/${experienceId}/fragments/${fragmentId}`, {
    method: 'DELETE',
  });
}

export async function getFragmentSignedUrl(
  storagePath: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error) return null;
  return data.signedUrl;
}
