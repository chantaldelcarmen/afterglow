import supabase from '../utils/supabase';

export async function createExperience(title: string, userId: string) {
  const { data, error } = await supabase
    .from('experiences')
    .insert({ title, user_id: userId })
    .select('id')
    .single();
  if (error) throw error;
  return data;
}

export async function getUserExperiences(userId: string) {
  const { data, error } = await supabase
    .from('experiences')
    .select('id, title, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
