import { prisma } from "../../../utils/prisma";

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

    // Get watering history ordered by most recent first
    const wateringHistory = await prisma.wateringHistory.findMany({
      where: { plantId: plantId },
      orderBy: { wateredAt: "desc" },
    });

    return {
      success: true,
      data: wateringHistory,
    };
  } catch (error) {
    console.error("Error fetching watering history:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch watering history",
    });
  }
});