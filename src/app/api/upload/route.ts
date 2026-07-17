import { NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/pjpeg",
  "image/x-png"
];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit for Base64 database persistence

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    // Validate file type and extension
    const isAllowedMime = ALLOWED_TYPES.includes(file.type.toLowerCase());
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isAllowedMime && !isAllowedExt) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.` 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar. Maksimal 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert file to Base64 Data URL to allow serverless persistence inside Turso database
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;
    const fileUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Gagal mengunggah berkas: ${(error as Error).message}` 
      }, 
      { status: 500 }
    );
  }
}
