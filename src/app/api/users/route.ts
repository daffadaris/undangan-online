import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateUsername } from "@/lib/username";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET /api/users — list all users (super admin only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: { guests: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users — create new owner (super admin only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { password } = body;
    const username = (body.username || "").toLowerCase().trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    // Check for duplicate username
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: "owner",
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("POST users error:", error);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}

// PUT /api/users — update user's username or password (super admin only)
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, username, password } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const data: any = {};

    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      const usernameError = validateUsername(normalizedUsername);
      if (usernameError) {
        return NextResponse.json({ error: usernameError }, { status: 400 });
      }
      // Check for duplicate
      const existing = await prisma.user.findUnique({ where: { username: normalizedUsername } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
      }
      data.username = normalizedUsername;
    }

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        _count: { select: { guests: true } },
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("PUT users error:", error);
    return NextResponse.json({ error: "Gagal mengupdate pengguna" }, { status: 500 });
  }
}

// DELETE /api/users — delete owner (super admin only)
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 });
    }

    // Prevent deleting super admin
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }
    if (target.role === "super_admin") {
      return NextResponse.json({ error: "Tidak dapat menghapus super admin" }, { status: 403 });
    }

    // Cascade: delete all guests belonging to this user
    await prisma.guest.deleteMany({ where: { userId } });
    await prisma.weddingConfig.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE users error:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
