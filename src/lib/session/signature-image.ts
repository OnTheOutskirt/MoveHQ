/** Max size for signature headshot stored in localStorage (base64). */
export const MAX_SIGNATURE_IMAGE_BYTES = 256 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function readSignatureImageFile(
  file: File,
  onSuccess: (dataUrl: string) => void,
  onError: (message: string) => void,
): void {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    onError("Use a PNG, JPEG, WebP, or GIF image.");
    return;
  }
  if (file.size > MAX_SIGNATURE_IMAGE_BYTES) {
    onError("Image must be under 256 KB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      onSuccess(reader.result);
    } else {
      onError("Could not read that file.");
    }
  };
  reader.onerror = () => onError("Could not read that file.");
  reader.readAsDataURL(file);
}
