import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DEVICE_COOKIE, deviceAccess, parseDeviceIds } from "@/lib/privacy";

// Marks a guest's invitation as opened. Called from the client only when the
// guest actually clicks "Buka Undangan" — so link-preview crawlers (WhatsApp,
// Telegram, etc.) and plain page fetches no longer flip openedAt.
// In Mode Privat this is also where a browser claims one of the guest's slots.
export async function POST(request: Request) {
  try {
    const { guestId } = await request.json();

    if (!guestId) {
      return NextResponse.json({ error: "Missing guest ID" }, { status: 400 });
    }

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: {
        openedAt: true,
        deviceIds: true,
        maxDevices: true,
        owner: { select: { weddingConfig: { select: { privateMode: true } } } },
      },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    let deviceData = {};
    if (guest.owner?.weddingConfig?.privateMode) {
      const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value;
      if (!deviceId) {
        return NextResponse.json({ error: "Missing device", reason: "no_device" }, { status: 403 });
      }
      const access = deviceAccess(guest, deviceId);
      if (access === "blocked") {
        return NextResponse.json({ error: "Device limit reached", reason: "device_limit" }, { status: 403 });
      }
      if (access === "available") {
        deviceData = { deviceIds: JSON.stringify([...parseDeviceIds(guest.deviceIds), deviceId]) };
      }
    }

    const now = new Date();
    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
        ...deviceData,
        openCount: { increment: 1 }, // every open
        lastOpenedAt: now, // most recent open
        ...(guest.openedAt ? {} : { openedAt: now }), // first open only
      },
      select: { openCount: true },
    });

    return NextResponse.json({ success: true, openCount: updated.openCount });
  } catch (error) {
    console.error("POST guest open error:", error);
    return NextResponse.json({ error: "Failed to mark opened" }, { status: 500 });
  }
}
