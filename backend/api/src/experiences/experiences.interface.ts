export interface Experience {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  experience_date: string | null;
  start_date: string | null;
  end_date: string | null;
  is_draft: boolean;
  user_id: string;
  anchor_fragment_id: string | null;
  anchor_storage_path: string | null;
  created_at: string;
  updated_at: string;
  emotion_tags: string[];
}
