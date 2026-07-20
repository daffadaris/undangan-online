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

    const { id } = await params;
    const body = await request.json();
    const { name, phone, group, rsvpStatus, numberOfGuests, wishes } = body;

    // Verify ownership (super admin can edit any)
    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    if (user.role !== "super_admin" && existing.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        group: group || null,
        rsvpStatus,
        numberOfGuests: rsvpStatus === "confirmed" ? numberOfGuests : 0,
        wishes: wishes || null,
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

    const { id } = await params;

    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    if (user.role !== "super_admin" && existing.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.guest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE guest error:", error);
    return NextResponse.json({ error: "Failed to delete guest" }, { status: 500 });
  }
}
