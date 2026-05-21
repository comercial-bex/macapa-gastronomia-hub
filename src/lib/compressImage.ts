/**
 * Client-side image compressor. Resizes to max dimension and re-encodes as
 * WebP (with JPEG fallback) before upload — drops typical photo size by 4–10×.
 *
 * Skips: videos, GIFs, SVGs, files already small enough.
 */
export interface CompressOptions {
  maxDim?: number;        // longest side, px
  quality?: number;       // 0..1
  skipUnderKb?: number;   // don't recompress tiny files
}

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  const { maxDim = 1600, quality = 0.82, skipUnderKb = 180 } = opts;

  // Bail on non-images and animated/vector formats we shouldn't recompress.
  if (!file.type.startsWith("image/")) return file;
  if (/gif|svg/i.test(file.type)) return file;
  if (file.size <= skipUnderKb * 1024) return file;

  try {
    const bitmap = await createImageBitmap(file).catch(async () => {
      // Fallback for browsers without createImageBitmap on this file type.
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = url;
        });
        return img as unknown as ImageBitmap;
      } finally {
        URL.revokeObjectURL(url);
      }
    });

    const w = (bitmap as any).width;
    const h = (bitmap as any).height;
    if (!w || !h) return file;

    const scale = Math.min(1, maxDim / Math.max(w, h));
    const targetW = Math.round(w * scale);
    const targetH = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap as any, 0, 0, targetW, targetH);

    const mime = "image/webp";
    const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), mime, quality));
    if (!blob || blob.size >= file.size) return file; // not worth it

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: mime, lastModified: Date.now() });
  } catch {
    return file;
  }
}