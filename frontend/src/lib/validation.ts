export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB

export function validatePhotoFile(file: File): ValidationResult {
  if (!PHOTO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || 'unknown'}. Accepted: JPEG, PNG, WebP.`,
    };
  }

  if (file.size > MAX_PHOTO_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum size is 10 MB.`,
    };
  }

  return { valid: true, error: null };
}
