import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function saveUploadedImage(
  file: File,
  subdir: string = "watering",
  plantId?: string,
): Promise<UploadResult> {
  try {
    // Create uploads directory structure
    // If plantId is provided: uploads/plants/[plantId]/
    // Otherwise: uploads/[subdir]/
    const baseDir = plantId 
      ? path.join(process.cwd(), "public", "uploads", "plants", plantId)
      : path.join(process.cwd(), "public", "uploads", subdir);
    
    if (!existsSync(baseDir)) {
      await mkdir(baseDir, { recursive: true });
    }

    // Generate timestamped filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").split(".")[0];
    const fileExtension = path.extname(file.name) || ".jpg";
    const filename = `${timestamp}${fileExtension}`;
    const filePath = path.join(baseDir, filename);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = plantId 
      ? `/uploads/plants/${plantId}/${filename}`
      : `/uploads/${subdir}/${filename}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Error saving uploaded image:", error);
    return {
      success: false,
      error: "Failed to save image",
    };
  }
}

export function isValidImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}
