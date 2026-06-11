/** Read a camera / gallery file as a compressed JPEG data URL for offline queue. */
export function readImageFileAsDataUrl(
  file: File,
  maxEdge = 1280,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
    reader.onload = () => {
      const src = reader.result;
      if (typeof src !== "string") {
        reject(new Error("Invalid image data"));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/** Placeholder when demo capture has no camera image. */
export function placeholderFieldImageDataUrl(label: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const gradient = ctx.createLinearGradient(0, 0, 320, 240);
  gradient.addColorStop(0, "#e2e8f0");
  gradient.addColorStop(1, "#cbd5e1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 320, 240);
  ctx.fillStyle = "#475569";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 28), 160, 120);
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText(new Date().toLocaleString(), 160, 142);
  return canvas.toDataURL("image/jpeg", 0.9);
}
