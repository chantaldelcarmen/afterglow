import supabase from '../utils/supabase';
import { apiFetch } from './api';
import type { Fragment } from '../types/fragment';

const BUCKET = 'fragments';

export async function uploadFragment(
  experienceId: string,
  file: File,
  caption?: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);
  const res = await apiFetch(`/experiences/${experienceId}/fragments`, {
    method: 'POST',
    body: form,
  });
  return res.json();
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

export function getFragmentPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
