import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const plantId = getRouterParam(event, "id");

    if (!plantId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Plant ID is required",
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

    // Get all photos for the plant from both PlantPhoto and WateringHistory
    const [plantPhotos, wateringPhotos] = await Promise.all([
      prisma.plantPhoto.findMany({
        where: { plantId: plantId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.wateringHistory.findMany({
        where: { 
          plantId: plantId,
          imageUrl: { not: null }
        },
        orderBy: { wateredAt: "desc" },
        select: {
          id: true,
          imageUrl: true,
          wateredAt: true,
          notes: true
        }
      })
    ]);

    // Combine and format all photos
    const allPhotos = [
      ...plantPhotos.map(photo => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        createdAt: photo.createdAt,
        type: 'photo' as const,
        notes: null
      })),
      ...wateringPhotos.map(watering => ({
        id: watering.id,
        imageUrl: watering.imageUrl!,
        createdAt: watering.wateredAt,
        type: 'watering' as const,
        notes: watering.notes
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: allPhotos,
    };
  } catch (error) {
    console.error("Error fetching plant photos:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch plant photos",
    });
  }
});
