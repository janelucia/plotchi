import { prisma } from "../../utils/prisma";
import type { CreatePlantData } from "../../../types/database";
import { requireUserSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const user = await requireUserSession(event);

  try {
    const body = (await readBody(event)) as CreatePlantData;

    // Validate required fields
    if (!body.name || !body.wateringFrequencyDays) {
      throw createError({
        statusCode: 400,
        statusMessage: "Name and watering frequency are required",
      });
    }

    if (body.wateringFrequencyDays < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "Watering frequency must be at least 1 day",
      });
    }

    const plant = await prisma.plant.create({
      data: {
        name: body.name.trim(),
        species: body.species?.trim() || null,
        location: body.location?.trim() || null,
        wateringFrequencyDays: body.wateringFrequencyDays,
        notes: body.notes?.trim() || null,
        profileImageUrl: body.imageUrl?.trim() || null,
        userId: user.id,
      },
    });

    return {
      success: true,
      data: plant,
    };
  } catch (error) {
    console.error("Error creating plant:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create plant",
    });
  }
});
