import type { Plant } from "@prisma/client";
import type { PlantStatus } from "../../app/types/database";

export function calculatePlantStatus(plant: Plant): PlantStatus {
  const now = new Date();
  const lastWatered = plant.lastWatered;

  let daysUntilNextWatering = plant.wateringFrequencyDays;
  let daysSinceWatered: number | undefined;
  let isOverdue = false;

  if (lastWatered) {
    const timeDiff = now.getTime() - lastWatered.getTime();
    daysSinceWatered = Math.floor(timeDiff / (1000 * 3600 * 24));
    daysUntilNextWatering = plant.wateringFrequencyDays - daysSinceWatered;
    isOverdue = daysUntilNextWatering < 0;
  } else {
    // Never watered - consider overdue
    isOverdue = true;
    daysUntilNextWatering = 0;
  }

  return {
    id: plant.id, // keep as string if it's a UUID
    name: plant.name,
    species: plant.species ?? undefined,
    lastWatered: plant.lastWatered ?? undefined,
    wateringFrequencyDays: plant.wateringFrequencyDays,
    profileImageUrl: plant.profileImageUrl ?? undefined,
    daysUntilNextWatering,
    isOverdue,
    daysSinceWatered,
  };
}

export function getPlantsNeedingWater(plants: Plant[]): PlantStatus[] {
  return plants
    .map(calculatePlantStatus)
    .filter((plant) => plant.isOverdue || plant.daysUntilNextWatering <= 0)
    .sort((a, b) => a.daysUntilNextWatering - b.daysUntilNextWatering);
}

export function getOverduePlants(plants: Plant[]): PlantStatus[] {
  return plants
    .map(calculatePlantStatus)
    .filter((plant) => plant.isOverdue)
    .sort((a, b) => a.daysUntilNextWatering - b.daysUntilNextWatering);
}
