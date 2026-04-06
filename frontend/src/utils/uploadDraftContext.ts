import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface PhotoUploadDraft {
  experienceId: string | null;
  file: File | null;
  caption: string;
}

export interface UploadDraftContextType {
  photoDraft: PhotoUploadDraft;
  setPhotoDraft: Dispatch<SetStateAction<PhotoUploadDraft>>;
}

export const EMPTY_PHOTO_DRAFT: PhotoUploadDraft = {
  experienceId: null,
  file: null,
  caption: '',
};

export const UploadDraftContext = createContext<UploadDraftContextType | null>(null);

export function useUploadDraft() {
  const context = useContext(UploadDraftContext);

  if (!context) {
    throw new Error('useUploadDraft must be used within an UploadDraftProvider');
  }

  return context;
}
