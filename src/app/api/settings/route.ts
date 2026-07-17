import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await prisma.weddingConfig.findUnique({
      where: { id: "config" },
    });
    return NextResponse.json({ config });
  } catch (error) {
    console.error("GET config error:", error);
    return NextResponse.json({ error: "Failed to fetch wedding config" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const config = await prisma.weddingConfig.update({
      where: { id: "config" },
      data: {
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
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("PUT config error:", error);
    return NextResponse.json({ error: "Failed to update wedding config" }, { status: 500 });
  }
}
