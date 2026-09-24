import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Door check-in for "Check-in QR". The guest's QR encodes
// {origin}/admin/checkin?code=XXXXXXXX; the usher (logged in as the owner)
// scans it and each code admits its confirmed pax exactly once.

const guestSelect = {
  id: true,
  name: true,
  group: true,
  rsvpStatus: true,
  numberOfGuests: true,
  checkedInAt: true,
  checkedInCount: true,
} as const;

function normaliseCode(raw: unknown): string {
  return String(raw || "").trim().toUpperCase();
}

async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role === "super_admin") {
    return { error: NextResponse.json({ error: "Check-in hanya untuk pemilik acara" }, { status: 403 }) };
  }
  return { user };
}

// Arrival stats for the check-in screen.
export async function GET() {
  try {
    const auth = await requireOwner();
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const [confirmed, arrived] = await Promise.all([
      prisma.guest.aggregate({
        where: { userId: user.userId, rsvpStatus: "confirmed" },
        _count: true,
        _sum: { numberOfGuests: true },
      }),
      prisma.guest.aggregate({
        where: { userId: user.userId, checkedInAt: { not: null } },
        _count: true,
        _sum: { checkedInCount: true },
      }),
    ]);

    return NextResponse.json({
      confirmedGuests: confirmed._count,
      confirmedPax: confirmed._sum.numberOfGuests || 0,
      arrivedGuests: arrived._count,
      arrivedPax: arrived._sum.checkedInCount || 0,
    });
  } catch (err) {
    console.error("GET checkin error:", err);
    return NextResponse.json({ error: "Failed to load check-in stats" }, { status: 500 });
  }
}

// Check a guest in. 404 unknown code, 409 already checked in.
export async function POST(request: Request) {
  try {
    const auth = await requireOwner();
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const code = normaliseCode((await request.json()).code);
    if (!code) {
      return NextResponse.json({ error: "Kode wajib diisi" }, { status: 400 });
    }

    const guest = await prisma.guest.findFirst({
      where: { checkinCode: code, userId: user.userId },
      select: guestSelect,
    });
    if (!guest) {
      return NextResponse.json({ error: "Kode tidak ditemukan", reason: "not_found" }, { status: 404 });
    }
    if (guest.checkedInAt) {
      return NextResponse.json({ error: "Sudah check-in", reason: "already", guest }, { status: 409 });
    }

    // Only claim the check-in if nobody else did in the meantime (two ushers
    // scanning the same screenshot at once).
    const pax = Math.max(1, guest.numberOfGuests);
    const { count } = await prisma.guest.updateMany({
      where: { id: guest.id, checkedInAt: null },
      data: { checkedInAt: new Date(), checkedInCount: pax },
    });
    const updated = await prisma.guest.findUnique({ where: { id: guest.id }, select: guestSelect });
    if (count === 0) {
      return NextResponse.json({ error: "Sudah check-in", reason: "already", guest: updated }, { status: 409 });
    }

    return NextResponse.json({ success: true, guest: updated });
  } catch (err) {
    console.error("POST checkin error:", err);
    return NextResponse.json({ error: "Gagal check-in" }, { status: 500 });
  }
}

// Undo a check-in (usher scanned the wrong guest).
export async function DELETE(request: Request) {
  try {
    const auth = await requireOwner();
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const code = normaliseCode((await request.json()).code);
    const { count } = await prisma.guest.updateMany({
      where: { checkinCode: code, userId: user.userId },
      data: { checkedInAt: null, checkedInCount: 0 },
    });
    if (count === 0) {
      return NextResponse.json({ error: "Kode tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE checkin error:", err);
    return NextResponse.json({ error: "Gagal membatalkan check-in" }, { status: 500 });
  }
}
