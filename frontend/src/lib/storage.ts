import { apiFetch } from './api';
import type { Fragment } from '../types/fragment';

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

export async function uploadTextFragment(
  experienceId: string,
  text: string,
  caption?: string,
): Promise<void> {
  await apiFetch(`/experiences/${experienceId}/fragments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'text',
      text_context: text,
      caption,
    }),
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

export async function setAnchorFragment(
  experienceId: string,
  fragmentId: string,
): Promise<void> {
  await apiFetch(`/experiences/${experienceId}/fragments/${fragmentId}/anchor`, {
    method: 'PATCH',
  });
}

export async function getFragmentSignedUrl(
  experienceId: string,
  fragmentId: string,
): Promise<string | null> {
  try {
    const res = await apiFetch(
      `/experiences/${experienceId}/fragments/${fragmentId}/signed-url`,
    );
    const data: { signedUrl?: string } = await res.json();

    return data.signedUrl ?? null;
  } catch {
    return null;
  }
}
