import { createHash } from "crypto";

// Uploaded images live in WeddingConfig as base64 data URLs (serverless-safe,
// see docs/07-operations.md). Inlining them made every invitation ~1.3 MB of
// HTML, sent twice (HTML + RSC payload) and never cached. The invitation now
// gets short /api/media URLs instead; the route decodes and serves the bytes.
// `?v=` is a content hash, so the URL changes whenever the image does and the
// response can be cached forever.

export const IMAGE_FIELDS = ["heroImage", "groomImage", "brideImage", "coupleImage", "qrisImage"] as const;
export type ImageField = (typeof IMAGE_FIELDS)[number];

const GALLERY_KEY = /^gallery-(\d{1,3})$/;

function parseGallery(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

function toMediaUrl(userId: string, key: string, value: string): string {
  if (!value.startsWith("data:")) return value; // external URL: leave as is
  const version = createHash("sha1").update(value).digest("hex").slice(0, 12);
  return `/api/media/${encodeURIComponent(userId)}/${key}?v=${version}`;
}

// Copy of the config with every inline image swapped for its /api/media URL.
export function withMediaUrls<T extends Record<string, unknown>>(config: T, userId: string): T {
  const out: Record<string, unknown> = { ...config };
  for (const field of IMAGE_FIELDS) {
    const value = config[field];
    if (typeof value === "string" && value) out[field] = toMediaUrl(userId, field, value);
  }
  if (typeof config.galleryImages === "string") {
    const gallery = parseGallery(config.galleryImages).map((url, i) => toMediaUrl(userId, `gallery-${i}`, url));
    out.galleryImages = JSON.stringify(gallery);
  }
  return out as T;
}

// Which WeddingConfig column holds a media key ("heroImage", "gallery-3", …).
export function mediaColumn(key: string): ImageField | "galleryImages" | null {
  if ((IMAGE_FIELDS as readonly string[]).includes(key)) return key as ImageField;
  if (GALLERY_KEY.test(key)) return "galleryImages";
  return null;
}

// The stored data URL for a media key, given that column's value.
export function pickMedia(key: string, columnValue: string | null | undefined): string | null {
  const match = key.match(GALLERY_KEY);
  const value = match ? parseGallery(columnValue)[Number(match[1])] : columnValue;
  return typeof value === "string" && value.startsWith("data:") ? value : null;
}

export function decodeDataUrl(dataUrl: string): { mime: string; bytes: Buffer } | null {
  const match = dataUrl.match(/^data:([\w.+/-]+);base64,([\s\S]*)$/);
  if (!match) return null;
  return { mime: match[1], bytes: Buffer.from(match[2], "base64") };
}
