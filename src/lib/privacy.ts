// "Mode Privat": each guest link may only be opened on a limited number of
// browsers. A browser is identified by the random `inv_dev` cookie that
// src/proxy.ts hands out on invitation routes; it is claimed for a guest when
// they click "Buka Undangan" (POST /api/guests/open), never on page load, so
// link-preview crawlers don't burn a slot.

export const DEVICE_COOKIE = "inv_dev";

// Default slots per guest link. Set explicitly on create: the production
// column was added with SQL DEFAULT 2, which SQLite can't alter in place.
export const DEFAULT_MAX_DEVICES = 1;

export type DeviceAccess = "registered" | "available" | "blocked";

export function parseDeviceIds(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((d) => typeof d === "string") : [];
  } catch {
    return [];
  }
}

export function deviceAccess(
  guest: { deviceIds: string; maxDevices: number },
  deviceId: string | undefined
): DeviceAccess {
  const ids = parseDeviceIds(guest.deviceIds);
  if (deviceId && ids.includes(deviceId)) return "registered";
  return ids.length < Math.max(1, guest.maxDevices) ? "available" : "blocked";
}
