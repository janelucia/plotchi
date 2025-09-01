import { prisma } from "../../../utils/prisma";
import { calculatePlantStatus } from "../../../utils/plant-helpers";
import { requireUserSession } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const user = await requireUserSession(event);
  
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid plant ID",
      });
    }

    const plant = await prisma.plant.findFirst({
      where: { 
        id,
        userId: user.id 
      },
      include: {
        wateringHistory: {
          orderBy: {
            wateredAt: "desc",
          },
          take: 20, // Last 20 watering events
        },
      },
    });

    if (!plant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Plant not found",
      });
    }

    const plantStatus = calculatePlantStatus(plant);

    return {
      success: true,
      data: {
        ...plant,
        status: plantStatus,
      },
    };
  } catch (error) {
    console.error("Error fetching plant:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch plant",
    });
  }
});
