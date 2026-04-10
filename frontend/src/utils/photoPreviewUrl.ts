const photoPreviewUrls = new WeakMap<File, string>();

export function getPhotoPreviewUrl(file: File) {
  const existingUrl = photoPreviewUrls.get(file);
  if (existingUrl) return existingUrl;

  const nextUrl = URL.createObjectURL(file);
  photoPreviewUrls.set(file, nextUrl);
  return nextUrl;
}

export function revokePhotoPreviewUrl(file: File | null) {
  if (!file) return;

  const previewUrl = photoPreviewUrls.get(file);
  if (!previewUrl) return;

  URL.revokeObjectURL(previewUrl);
  photoPreviewUrls.delete(file);
}
