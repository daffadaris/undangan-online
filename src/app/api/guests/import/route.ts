import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "super_admin") {
      return NextResponse.json({ error: "Super admin tidak dapat mengimpor tamu pemilik" }, { status: 403 });
    }

    const body = await request.json();
    const { guests } = body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: "Data tamu tidak valid atau kosong" },
        { status: 400 }
      );
    }

    const targetUserId = user.userId;

    const imported: string[] = [];
    const skipped: string[] = [];

    for (const guest of guests) {
      const name = (guest.name || "").trim();
      if (!name) {
        skipped.push("(nama kosong)");
        continue;
      }

      try {
        let baseSlug = slugify(name);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
          const existing = await prisma.guest.findUnique({ where: { slug } });
          if (!existing) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        await prisma.guest.create({
          data: {
            name,
            slug,
            phone: (guest.phone || "").trim() || null,
            group: (guest.group || "").trim() || null,
            userId: targetUserId,
          },
        });

        imported.push(name);
      } catch (err) {
        console.error(`Failed to import guest: ${name}`, err);
        skipped.push(name);
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      skipped,
      importedNames: imported,
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Gagal mengimpor data tamu" },
      { status: 500 }
    );
  }
}
