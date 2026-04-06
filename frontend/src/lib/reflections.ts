import { apiFetch } from './api';

export interface Reflection {
    id: string;
    experience_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

interface ReflectionApiResponse {
    id: string;
    experience_id: string;
    user_id: string;
    reflection_text: string;
    created_at: string;
    updated_at: string | null;
}

function mapReflection(data: ReflectionApiResponse): Reflection {
    // Frontend uses `content`, while the backend response field is `reflection_text`.
    return {
        id: data.id,
        experience_id: data.experience_id,
        user_id: data.user_id,
        content: data.reflection_text,
        created_at: data.created_at,
        updated_at: data.updated_at ?? data.created_at,
    };
}

export async function getReflections(experienceId: string): Promise<Reflection[]> {
    const res = await apiFetch(`/experiences/${experienceId}/reflections`, {
        method: 'GET',
    });
    const data = (await res.json()) as ReflectionApiResponse[];
    return data.map(mapReflection);
}

export async function createReflection(experienceId: string, content: string): Promise<Reflection> {
    const res = await apiFetch(`/experiences/${experienceId}/reflections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection_text: content }),
    });
    const data = (await res.json()) as ReflectionApiResponse;
    return mapReflection(data);
}

export async function updateReflection(
    experienceId: string,
    reflectionId: string,
    content: string,
): Promise<Reflection> {
    const res = await apiFetch(`/experiences/${experienceId}/reflections/${reflectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection_text: content }),
    });
    const data = (await res.json()) as ReflectionApiResponse;
    return mapReflection(data);
}

export async function deleteReflection(experienceId: string, reflectionId: string): Promise<void> {
    await apiFetch(`/experiences/${experienceId}/reflections/${reflectionId}`, {
        method: 'DELETE',
    });
}
