import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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
const MAX_SIZE = 10 * 1024 * 1024; // Increase limit to 10MB to accommodate high-res camera photos

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    // Validate file type and extension (using extension as fallback for browser compatibility)
    const isAllowedMime = ALLOWED_TYPES.includes(file.type.toLowerCase());
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isAllowedMime && !isAllowedExt) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Format file tidak didukung: ${file.type || "unknown"}. Gunakan JPG, PNG, GIF, atau WebP.` 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar. Maksimal 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create the public/uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Ignore if directory already exists
    }

    // Generate a unique filename to prevent conflicts
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFilename);

    await writeFile(filePath, buffer);

    // Serve via API route instead of static — Next.js doesn't serve runtime-created public files
    const fileUrl = `/api/upload/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengunggah berkas" }, { status: 500 });
  }
}
