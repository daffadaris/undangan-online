import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, rsvpStatus, numberOfGuests, wishes } = body;

    if (!guestId) {
      return NextResponse.json({ error: "Missing guest ID" }, { status: 400 });
    }

    const updateData: any = {
      rsvpStatus,
      numberOfGuests: rsvpStatus === "confirmed" ? numberOfGuests : 0,
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
