import { apiFetch } from './api';

type DemoResetResponse = {
  message: string;
  seededExperiences: number;
};

export async function resetDemoData(): Promise<DemoResetResponse> {
  const res = await apiFetch('/demo/reset', {
    method: 'POST',
  });

  return res.json();
}
