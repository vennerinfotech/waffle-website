import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in the request" },
        { status: 400 }
      );
    }

    // Generate a unique, sanitized filename
    const originalName = file.name || "image.png";
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext);
    const sanitizedBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    const uniqueFilename = `${Date.now()}-${sanitizedBase}${ext}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const publicImagesDir = path.join(process.cwd(), "public", "images");

    // Ensure directory exists
    await fs.mkdir(publicImagesDir, { recursive: true });

    const filePath = path.join(publicImagesDir, uniqueFilename);
    await fs.writeFile(filePath, fileBuffer);

    // Return the public relative URL
    const publicUrl = `/images/${uniqueFilename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
