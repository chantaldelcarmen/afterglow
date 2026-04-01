import { apiFetch } from './api';
import type { Experience } from '../types/experience';


/*
POST create an experience for the user
*/
export async function createExperience(
  title: string, 
  // match create-experience.dto
  options?: {
    description?: string,
    location?: string,
    experience_date?: string,
    start_date?: string,
    end_date?: string,
    is_draft?: boolean,
    emotion_tags?: string[],
  },
): Promise<Experience> {
  const res = await apiFetch('/experiences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, ...options }),
  });

  return res.json();
}


/*
GET all experiences associated with user
*/
export async function getUserExperiences(): Promise<Experience[]> {
  const res = await apiFetch('/experiences', {
    method: 'GET',
  });

  return res.json();
}


/*
GET a single experience by its id
*/
export async function getOneExperience(
  experienceId: string,
): Promise<Experience> {
  const res = await apiFetch(`/experiences/${experienceId}`, {
    method: 'GET',
  });

  return res.json();
}


/*
DELETE an experience by its id
*/
export async function removeExperience(
  experienceId: string,
): Promise<void> {
  await apiFetch(`/experiences/${experienceId}`, {
    method: 'DELETE',
  });
  // success of removal is in res status
}


/*
PATCH update an existing user experience from its id
*/
export async function updateExperience(
  experienceId: string,
  // matches update-experience.dto
  options: {
    title?: string,
    description?: string,
    location?: string,
    experience_date?: string,
    start_date?: string,
    end_date?: string,
    is_draft?: boolean,
    emotion_tags?: string[],
  },
): Promise<Experience> {
  const res = await apiFetch(`/experiences/${experienceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...options }),
  });

  return res.json();
}
