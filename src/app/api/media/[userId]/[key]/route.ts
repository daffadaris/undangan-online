import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DEVICE_COOKIE } from "@/lib/privacy";
import { decodeDataUrl, mediaColumn, pickMedia } from "@/lib/media";

// Serves an invitation image stored as a data URL in WeddingConfig (see
// src/lib/media.ts). URLs carry a content hash (?v=), so responses are
// immutable. Mode Privat weddings only serve browsers that claimed one of the
// owner's guest links, and never let shared caches keep a copy.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string; key: string }> }
) {
  const { userId, key } = await params;
  const column = mediaColumn(key);
  if (!column) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const config = await prisma.weddingConfig.findUnique({
    where: { userId },
    select: { [column]: true, privateMode: true },
  });
  const stored = pickMedia(key, config?.[column] as string | null | undefined);
  const decoded = stored ? decodeDataUrl(stored) : null;
  if (!config || !decoded) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (config.privateMode) {
    const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value;
    const allowed =
      deviceId &&
      (await prisma.guest.findFirst({
        where: { userId, deviceIds: { contains: `"${deviceId}"` } },
        select: { id: true },
      }));
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return new NextResponse(new Uint8Array(decoded.bytes), {
    headers: {
      "Content-Type": decoded.mime,
      "Content-Length": String(decoded.bytes.length),
      "Cache-Control": `${config.privateMode ? "private" : "public"}, max-age=31536000, immutable`,
      "X-Content-Type-Options": "nosniff",
      // Uploaded SVGs are served from our origin: never let them run script
      // if someone opens the URL directly.
      "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}
