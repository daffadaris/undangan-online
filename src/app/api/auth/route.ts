import { NextResponse } from "next/server";
import { loginUser, logoutUser, getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const user = await loginUser(username, password);

    if (user) {
      return NextResponse.json({ success: true, role: user.role });
    } else {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Gagal autentikasi" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await logoutUser();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth DELETE error:", error);
    return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
  }
}
