import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, randomSuffix, newCheckinCode } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterUserId = searchParams.get("userId");

    // Super admin can filter by userId; owners only see their own
    const where: any = {};
    if (user.role === "super_admin" && filterUserId) {
      where.userId = filterUserId;
    } else if (user.role !== "super_admin") {
      where.userId = user.userId;
    }

    const guests = await prisma.guest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { username: true } } },
    });
    return NextResponse.json({ guests });
  } catch (error) {
    console.error("GET guests error:", error);
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "super_admin") {
      return NextResponse.json({ error: "Super admin tidak dapat menambah tamu pemilik" }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, group } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama tamu wajib diisi" }, { status: 400 });
    }

    const targetUserId = user.userId;

    // Random suffix keeps links unguessable (/owner/budi-x7k2, not /owner/budi).
    const baseSlug = `${slugify(name) || "tamu"}-${randomSuffix()}`;
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.guest.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        slug,
        phone: phone || null,
        group: group || null,
        checkinCode: newCheckinCode(),
        userId: targetUserId,
      },
    });

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error("POST guest error:", error);
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}
