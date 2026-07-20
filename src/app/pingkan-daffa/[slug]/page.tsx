import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface GuestPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuestPage({ params }: GuestPageProps) {
  const { slug } = await params;

  // Find the guest to determine the owner
  const guest = await prisma.guest.findUnique({
    where: { slug },
    include: { owner: true },
  });

  if (!guest || !guest.owner) {
    return notFound();
  }

  // Redirect to the new URL structure
  redirect(`/${guest.owner.username}/${slug}`);
}
