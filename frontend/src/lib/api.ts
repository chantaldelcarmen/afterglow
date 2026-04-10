import supabase from '../utils/supabase';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `API error ${res.status}`);
  }
  return res;
}

export async function getSettings(): Promise<{ ai_reflection_enabled: boolean }> {
  const res = await apiFetch('/settings');
  return res.json();
}

export async function patchSettings(body: { ai_reflection_enabled: boolean }): Promise<{ ai_reflection_enabled: boolean }> {
  const res = await apiFetch('/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}
