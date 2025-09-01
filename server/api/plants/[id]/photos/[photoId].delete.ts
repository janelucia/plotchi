import { prisma } from "../../../../utils/prisma";
import { unlink } from "fs/promises";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    const plantId = getRouterParam(event, "id");
    const photoId = getRouterParam(event, "photoId");
    const query = getQuery(event);
    const photoType = query.type as 'photo' | 'watering';

    if (!plantId || !photoId || !photoType) {
      throw createError({
        statusCode: 400,
        statusMessage: "Plant ID, Photo ID, and type are required",
      });
    }

    // Verify plant exists
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Plant not found",
      });
    }

    let imageUrl: string | null = null;
    let wasProfileImage = false;

    if (photoType === 'photo') {
      // Delete from PlantPhoto table
      const photo = await prisma.plantPhoto.findUnique({
        where: { id: photoId },
      });

      if (!photo || photo.plantId !== plantId) {
        throw createError({
          statusCode: 404,
          statusMessage: "Photo not found",
        });
      }

      imageUrl = photo.imageUrl;
      wasProfileImage = plant.profileImageUrl === imageUrl;

      await prisma.plantPhoto.delete({
        where: { id: photoId },
      });
    } else {
      // Delete from WateringHistory (only remove the image, keep the watering record)
      const wateringRecord = await prisma.wateringHistory.findUnique({
        where: { id: photoId },
      });

      if (!wateringRecord || wateringRecord.plantId !== plantId) {
        throw createError({
          statusCode: 404,
          statusMessage: "Watering record not found",
        });
      }

      imageUrl = wateringRecord.imageUrl;
      wasProfileImage = plant.profileImageUrl === imageUrl;

      // Remove the image from watering record but keep the record
      await prisma.wateringHistory.update({
        where: { id: photoId },
        data: { imageUrl: null },
      });
    }

    // Delete the physical file
    if (imageUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", imageUrl);
        await unlink(filePath);
      } catch (fileError) {
        console.warn("Could not delete physical file:", imageUrl, fileError);
        // Continue even if file deletion fails
      }
    }

    // If this was the profile image, find a new profile image
    if (wasProfileImage) {
      // Get the most recent remaining photo
      const [remainingPlantPhotos, remainingWateringPhotos] = await Promise.all([
        prisma.plantPhoto.findFirst({
          where: { plantId: plantId },
          orderBy: { createdAt: "desc" },
          select: { imageUrl: true }
        }),
        prisma.wateringHistory.findFirst({
          where: { 
            plantId: plantId,
            imageUrl: { not: null }
          },
          orderBy: { wateredAt: "desc" },
          select: { imageUrl: true }
        })
      ]);

      // Determine which is more recent and set as new profile image
      let newProfileImageUrl: string | null = null;
      if (remainingPlantPhotos && remainingWateringPhotos) {
        // Both exist, we'd need creation dates to compare properly
        // For now, prioritize watering photos as they're more recent activity
        newProfileImageUrl = remainingWateringPhotos.imageUrl;
      } else if (remainingPlantPhotos) {
        newProfileImageUrl = remainingPlantPhotos.imageUrl;
      } else if (remainingWateringPhotos) {
        newProfileImageUrl = remainingWateringPhotos.imageUrl;
      }

      // Update plant's profile image
      await prisma.plant.update({
        where: { id: plantId },
        data: { profileImageUrl: newProfileImageUrl },
      });
    }

    return {
      success: true,
      message: "Photo deleted successfully",
      wasProfileImage,
    };
  } catch (error) {
    console.error("Error deleting photo:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete photo",
    });
  }
});