export type FragmentType = 'photo' | 'video' | 'text';

export interface Fragment {
  id: string;
  experience_id: string;
  user_id: string;
  type: FragmentType;
  storage_path: string | null;
  storage_url: string | null;
  caption: string | null;
  content: string | null;
  is_anchor: boolean;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface UploadProgress {
  status: 'idle' | 'validating' | 'uploading' | 'done' | 'error';
  error: string | null;
}
