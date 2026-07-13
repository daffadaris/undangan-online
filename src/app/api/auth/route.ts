import { NextResponse } from "next/server";
import { loginAdmin, logoutAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    console.log("[Auth API] Received login request");
    const success = await loginAdmin(password);
    console.log("[Auth API] Password validation result:", success);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await logoutAdmin();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth DELETE error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
