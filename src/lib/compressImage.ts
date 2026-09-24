// Browser-side image compression before upload: shrink to at most `maxEdge`
// px on the long side and re-encode as WebP (JPEG where the browser can't
// encode WebP — Safari silently falls back to PNG, which is bigger). Keeps the
// original when it is already smaller, or for formats where re-encoding would
// hurt (GIF animation, SVG).

interface CompressOptions {
  maxEdge?: number;
  quality?: number;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File, { maxEdge = 1600, quality = 0.8 }: CompressOptions = {}): Promise<File> {
  if (!/^image\/(jpe?g|png|webp|pjpeg|x-png)$/i.test(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, "image/webp", quality);
    if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!blob || blob.size >= file.size) return file;

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
    return new File([blob], name, { type: blob.type });
  } catch {
    return file; // unsupported/corrupt image: let the server validate the original
  }
}
