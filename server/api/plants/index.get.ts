import { prisma } from "../../utils/prisma";
import { calculatePlantStatus } from "../../utils/plant-helpers";
import { requireUserSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const user = await requireUserSession(event);
  
  try {
    const plants = await prisma.plant.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const plantsWithStatus = plants.map(calculatePlantStatus);

    return {
      success: true,
      data: plantsWithStatus,
    };
  } catch (error) {
    console.error("Error fetching plants:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch plants",
    });
  }
});
