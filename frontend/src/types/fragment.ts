export type FragmentType = 'photo' | 'video' | 'audio' | 'text';

export interface Fragment {
  id: string;
  experience_id: string;
  type: FragmentType;
  caption: string | null;
  storage_path: string | null;
  text_context: string | null;
  created_at: string;
}

export interface FragmentInsert {
  experience_id: string;
  type: FragmentType;
  caption: string | null;
  storage_path: string | null;
  text_context: string | null;
}

export interface UploadProgress {
  status: 'idle' | 'validating' | 'uploading' | 'saving' | 'done' | 'error';
  error: string | null;
}
