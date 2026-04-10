export interface Fragment {
  id: string;
  experience_id: string;
  type: 'photo' | 'video' | 'audio' | 'text';
  caption: string | null;
  storage_path: string | null;
  text_context: string | null;
  created_at: string;
}
