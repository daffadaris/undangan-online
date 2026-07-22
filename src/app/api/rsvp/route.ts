import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, rsvpStatus, numberOfGuests, wishes } = body;

    if (!guestId) {
      return NextResponse.json({ error: "Missing guest ID" }, { status: 400 });
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
