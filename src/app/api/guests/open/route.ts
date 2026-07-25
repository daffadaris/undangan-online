import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Marks a guest's invitation as opened. Called from the client only when the
// guest actually clicks "Buka Undangan" — so link-preview crawlers (WhatsApp,
// Telegram, etc.) and plain page fetches no longer flip openedAt.
export async function POST(request: Request) {
  try {
    const { guestId } = await request.json();

    if (!guestId) {
      return NextResponse.json({ error: "Missing guest ID" }, { status: 400 });
    }

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { openedAt: true },
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const now = new Date();
    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
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
