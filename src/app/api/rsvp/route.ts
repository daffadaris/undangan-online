import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DEVICE_COOKIE, deviceAccess } from "@/lib/privacy";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, rsvpStatus, numberOfGuests, wishes } = body;

    if (!guestId) {
      return NextResponse.json({ error: "Missing guest ID" }, { status: 400 });
    }

    // Mode Privat: only browsers that claimed this guest's link may RSVP for it.
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: {
        deviceIds: true,
        maxDevices: true,
        owner: { select: { weddingConfig: { select: { privateMode: true } } } },
      },
    });
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    if (guest.owner?.weddingConfig?.privateMode) {
      const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value;
      if (deviceAccess(guest, deviceId) !== "registered") {
        return NextResponse.json({ error: "Device not allowed", reason: "device_limit" }, { status: 403 });
      }
    }

    // Confirmed guests are always 1-5 pax; anything else (missing, 0, out of range)
    // would silently drop them out of the "Total Pax Kehadiran" stat.
    const pax = Math.min(5, Math.max(1, Math.round(Number(numberOfGuests)) || 1));

    const updateData: any = {
      rsvpStatus,
      numberOfGuests: rsvpStatus === "confirmed" ? pax : 0,
    };

    if (wishes !== undefined) {
      updateData.wishes = wishes;
      updateData.wishSentAt = new Date();
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: updateData,
    });

    return NextResponse.json({ success: true, guest: updatedGuest });
  } catch (error) {
    console.error("POST RSVP error:", error);
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}
