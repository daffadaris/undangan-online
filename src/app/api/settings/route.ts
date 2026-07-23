import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const targetUserId = user.role === "super_admin" && filterUserId ? filterUserId : user.userId;

    const config = await prisma.weddingConfig.findUnique({
      where: { userId: targetUserId },
    });
    return NextResponse.json({ config });
  } catch (error) {
    console.error("GET config error:", error);
    return NextResponse.json({ error: "Failed to fetch wedding config" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "super_admin") {
      return NextResponse.json({ error: "Super admin tidak dapat mengubah undangan pemilik" }, { status: 403 });
    }

    const body = await request.json();
    const targetUserId = user.userId;
    const updateData = {
      groomName: body.groomName,
      groomNickname: body.groomNickname,
      groomParents: body.groomParents,
      brideName: body.brideName,
      brideNickname: body.brideNickname,
      brideParents: body.brideParents,
      akadDate: body.akadDate,
      akadTime: body.akadTime,
      akadVenue: body.akadVenue,
      akadAddress: body.akadAddress,
      akadMapsUrl: body.akadMapsUrl,
      resepsiDate: body.resepsiDate,
      resepsiTime: body.resepsiTime,
      resepsiVenue: body.resepsiVenue,
      resepsiAddress: body.resepsiAddress,
      resepsiMapsUrl: body.resepsiMapsUrl,
      loveStory: body.loveStory,
      giftInfo: body.giftInfo,
      musicUrl: body.musicUrl,
      theme: body.theme,
      design: body.design,
      heroImage: body.heroImage,
      groomImage: body.groomImage,
      brideImage: body.brideImage,
      coupleImage: body.coupleImage,
      galleryImages: body.galleryImages,
      showLoveStory: body.showLoveStory,
      showGiftInfo: body.showGiftInfo,
      showRsvp: body.showRsvp,
      showGallery: body.showGallery,
      showAkad: body.showAkad,
      showResepsi: body.showResepsi,
      akadTitle: body.akadTitle,
      resepsiTitle: body.resepsiTitle,
      whatsappTemplate: body.whatsappTemplate,
      groomImagePosition: body.groomImagePosition,
      brideImagePosition: body.brideImagePosition,
      heroImagePosition: body.heroImagePosition,
    };

    const config = await prisma.weddingConfig.upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("PUT config error:", error);
    return NextResponse.json({ error: "Failed to update wedding config" }, { status: 500 });
  }
}
