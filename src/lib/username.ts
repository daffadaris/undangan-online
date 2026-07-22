export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "login",
  "logout",
  "_next",
  "static",
  "public",
  "uploads",
  "icon.svg",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "www",
  "app",
  "assets",
]);

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

export function validateUsername(username: string): string | null {
  if (!username) {
    return "Username wajib diisi";
  }
  const normalized = username.toLowerCase();
  if (!USERNAME_PATTERN.test(normalized)) {
    return "Username harus 2-32 karakter huruf kecil, angka, dan tanda hubung (tidak boleh diawali/diakhiri tanda hubung)";
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return "Username ini tidak dapat digunakan";
  }
  return null;
}
