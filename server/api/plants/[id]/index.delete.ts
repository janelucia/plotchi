import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid plant ID",
      });
    }

    // Check if plant exists
    const existingPlant = await prisma.plant.findUnique({
      where: { id },
    });

    if (!existingPlant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Plant not found",
      });
    }

    // Delete plant (cascade will handle watering history)
    await prisma.plant.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Plant deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting plant:", error);

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete plant",
    });
  }
});
