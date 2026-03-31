import { apiFetch } from './api';

export interface Reflection {
    id: string;
    experience_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export async function getReflections(experienceId: string): Promise<Reflection[]> {
    const res = await apiFetch(`/experiences/${experienceId}/reflections`, {
        method: 'GET',
    });
    return res.json();
}

export async function createReflection(experienceId: string, content: string): Promise<Reflection> {
    const res = await apiFetch(`/experiences/${experienceId}/reflections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    return res.json();
}

export async function deleteReflection(experienceId: string, reflectionId: string): Promise<void> {
    await apiFetch(`/experiences/${experienceId}/reflections/${reflectionId}`, {
        method: 'DELETE',
    });
}
