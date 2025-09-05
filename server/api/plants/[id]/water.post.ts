import { prisma } from "../../../utils/prisma";
import {
  saveUploadedImage,
  isValidImageFile,
} from "../../../utils/file-upload";
import { requireUserSession } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const user = await requireUserSession(event);
  
  try {
    const plantId = getRouterParam(event, "id");

    if (!plantId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid plant ID",
      });
    }

    // Check if plant exists and belongs to user
    const existingPlant = await prisma.plant.findFirst({
      where: { 
        id: plantId,
        userId: user.id 
      },
    });

    if (!existingPlant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Plant not found",
      });
    }

    const now = new Date();
    let imageUrl: string | null = null;
    let notes: string | null = null;

    // Check content type to determine if it's multipart/form-data or JSON
    const contentType = getHeader(event, "content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form with potential image upload
      const formData = await readMultipartFormData(event);

      if (formData) {
        for (const field of formData) {
          if (field.name === "notes" && field.data) {
            notes = field.data.toString().trim() || null;
          } else if (field.name === "photo" && field.data && field.filename) {
            // Create a File-like object from the form data
            const uint8Array = new Uint8Array(field.data);
            const file = new File([uint8Array], field.filename, {
              type: field.type || "image/jpeg",
            });

            if (isValidImageFile(file)) {
              const uploadResult = await saveUploadedImage(file, "watering", plantId);
              if (uploadResult.success && uploadResult.url) {
                imageUrl = uploadResult.url;
              } else {
                throw createError({
                  statusCode: 400,
                  statusMessage: uploadResult.error || "Failed to upload image",
                });
              }
            } else {
              throw createError({
                statusCode: 400,
                statusMessage:
                  "Invalid image file. Only JPEG, PNG, and WebP files under 10MB are allowed.",
              });
            }
          }
        }
      }
    } else {
      // Handle JSON request
      try {
        const body = (await readBody(event)) as {
          notes?: string;
          imageUrl?: string;
        };
        notes = body.notes?.trim() || null;
        imageUrl = body.imageUrl?.trim() || null;
      } catch (error) {
        // If no body or invalid JSON, continue with defaults (notes and imageUrl remain null)
      }
    }

    // Create watering history record and update plant's last watered date
    // If there's an image, also set it as the profile picture (latest photo becomes profile)
    const [wateringRecord, updatedPlant] = await prisma.$transaction([
      prisma.wateringHistory.create({
        data: {
          plantId,
          wateredAt: now,
          notes,
          imageUrl,
        },
      }),
      prisma.plant.update({
        where: { id: plantId },
        data: {
          lastWatered: now,
          // Set the new photo as profile picture if an image was uploaded
          ...(imageUrl && { profileImageUrl: imageUrl }),
        },
      }),
    ]);

    return {
      success: true,
      data: {
        watering: wateringRecord,
        plant: updatedPlant,
      },
      message: "Plant watered successfully",
    };
  } catch (error) {
    console.error("Error watering plant:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to water plant",
    });
  }
});
