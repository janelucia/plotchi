import { promises as fs } from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);

    if (!form || !form.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "No file uploaded",
      });
    }

    const file = form[0];

    if (!file || !file.filename || !file.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid file data",
      });
    }

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!file.type || !allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Only image files (JPEG, PNG, WebP) are allowed",
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.filename);
    const filename = `${timestamp}_${randomString}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    await fs.writeFile(filePath, file.data);

    // Return public URL
    const imageUrl = `/uploads/${filename}`;

    return {
      success: true,
      data: {
        imageUrl,
        filename,
      },
    };
  } catch (error) {
    console.error("Error uploading file:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to upload file",
    });
  }
});
