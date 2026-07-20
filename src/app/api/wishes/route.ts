import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    // Build where clause: admin sees their own (or all if super admin), public needs userId param
    const where: any = {
      wishes: { not: null },
    };

    if (user) {
      // Admin: owner sees own, super admin can filter
      if (user.role === "super_admin" && userIdParam) {
        where.userId = userIdParam;
      } else if (user.role !== "super_admin") {
        where.userId = user.userId;
      }
    } else if (userIdParam) {
      // Public: filter by userId from query param
      where.userId = userIdParam;
    }

    const wishes = await prisma.guest.findMany({
      where,
      select: {
        id: true,
        name: true,
        wishes: true,
        rsvpStatus: true,
        wishSentAt: true,
        owner: { select: { username: true } },
      },
      orderBy: {
        wishSentAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ wishes });
  } catch (error) {
    console.error("GET wishes error:", error);
    return NextResponse.json({ error: "Failed to fetch wishes" }, { status: 500 });
  }
}
