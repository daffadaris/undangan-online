import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "super_admin") {
      return NextResponse.json({ error: "Super admin tidak dapat mengubah tamu pemilik" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, phone, group, rsvpStatus, numberOfGuests, wishes } = body;

    // Verify ownership
    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    if (existing.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fields left out of the payload keep their current value — otherwise a partial
    // update would reset the guest's pax (and phone/group) behind the admin's back.
    const nextStatus = rsvpStatus === undefined ? existing.rsvpStatus : rsvpStatus;
    const requestedPax = numberOfGuests === undefined ? existing.numberOfGuests : numberOfGuests;
    const pax = Math.min(5, Math.max(1, Math.round(Number(requestedPax)) || 1));

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name: name === undefined ? existing.name : name,
        phone: phone === undefined ? existing.phone : phone || null,
        group: group === undefined ? existing.group : group || null,
        rsvpStatus: nextStatus,
        numberOfGuests: nextStatus === "confirmed" ? pax : 0,
        wishes: wishes === undefined ? existing.wishes : wishes || null,
      },
    });

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error("PUT guest error:", error);
    return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "super_admin") {
      return NextResponse.json({ error: "Super admin tidak dapat menghapus tamu pemilik" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    if (existing.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.guest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE guest error:", error);
    return NextResponse.json({ error: "Failed to delete guest" }, { status: 500 });
  }
}
