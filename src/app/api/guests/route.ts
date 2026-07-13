import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ guests });
  } catch (error) {
    console.error("GET guests error:", error);
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, group } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama tamu wajib diisi" }, { status: 400 });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    // Check for collision and loop until a unique slug is found
    while (true) {
      const existing = await prisma.guest.findUnique({
        where: { slug },
      });
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
      },
    });

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error("POST guest error:", error);
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}
