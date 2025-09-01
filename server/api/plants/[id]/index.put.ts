import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const plantId = getRouterParam(event, "id");
    const body = await readBody(event);

    if (!plantId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Plant ID is required",
      });
    }

    // Validate required fields
    if (body.name && typeof body.name !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "Name must be a string",
      });
    }

    if (
      body.wateringFrequencyDays &&
      (typeof body.wateringFrequencyDays !== "number" ||
        body.wateringFrequencyDays < 1)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Watering frequency must be a positive number",
      });
    }

    // Check if plant exists
    const existingPlant = await prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!existingPlant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Plant not found",
      });
    }

    // Update the plant
    const updatedPlant = await prisma.plant.update({
      where: { id: plantId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.species !== undefined && { species: body.species }),
        ...(body.wateringFrequencyDays && {
          wateringFrequencyDays: body.wateringFrequencyDays,
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Plant updated successfully",
      data: updatedPlant,
    };
  } catch (error) {
    console.error("Update plant error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update plant",
    });
  }
});
