import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  EMPTY_PHOTO_DRAFT,
  UploadDraftContext,
} from './uploadDraftContext';

export function UploadDraftProvider({ children }: { children: ReactNode }) {
  const [photoDraft, setPhotoDraft] = useState(EMPTY_PHOTO_DRAFT);

  const value = useMemo(
    () => ({ photoDraft, setPhotoDraft }),
    [photoDraft],
  );

  return (
    <UploadDraftContext.Provider value={value}>
      {children}
    </UploadDraftContext.Provider>
  );
}
