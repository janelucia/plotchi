import { prisma } from "../../../../utils/prisma";
import { requireUserSession } from "../../../../utils/session";

export default defineEventHandler(async (event) => {
  const user = await requireUserSession(event);
  
  try {
    const plantId = getRouterParam(event, "id");
    const body = await readBody(event);

    if (!plantId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Plant ID is required",
      });
    }

    if (!body.imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: "Image URL is required",
      });
    }

    // Verify plant exists and belongs to user
    const plant = await prisma.plant.findFirst({
      where: { 
        id: plantId,
        userId: user.id 
      },
    });

    if (!plant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Plant not found",
      });
    }

    // Create plant photo
    const plantPhoto = await prisma.plantPhoto.create({
      data: {
        plantId: plantId,
        imageUrl: body.imageUrl.trim(),
      },
    });

    // If this is marked as profile photo, update plant's profile image
    if (body.isProfile) {
      await prisma.plant.update({
        where: { id: plantId },
        data: { profileImageUrl: body.imageUrl.trim() },
      });
    }

    return {
      success: true,
      data: plantPhoto,
    };
  } catch (error) {
    console.error("Error creating plant photo:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create plant photo",
    });
  }
});
