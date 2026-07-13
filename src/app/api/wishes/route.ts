import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const wishes = await prisma.guest.findMany({
      where: {
        wishes: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        wishes: true,
        rsvpStatus: true,
        wishSentAt: true,
      },
      orderBy: {
        wishSentAt: "desc",
      },
      take: 50, // limit to recent 50 wishes
    });

    return NextResponse.json({ wishes });
  } catch (error) {
    console.error("GET wishes error:", error);
    return NextResponse.json({ error: "Failed to fetch wishes" }, { status: 500 });
  }
}
