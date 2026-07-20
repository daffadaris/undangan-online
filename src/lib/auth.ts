import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "admin_session";

export interface SessionUser {
  userId: string;
  username: string;
  role: "super_admin" | "owner";
}

export async function loginUser(username: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const sessionUser: SessionUser = {
    userId: user.id,
    username: user.username,
    role: user.role as "super_admin" | "owner",
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(sessionUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
    sameSite: "lax",
  });

  return sessionUser;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return null;

  try {
    const user = JSON.parse(session.value) as SessionUser;
    return user;
  } catch {
    return null;
  }
}

export async function checkAuth(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
