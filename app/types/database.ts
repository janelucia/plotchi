import type { Plant, WateringHistory, User } from "@prisma/client";

export type { Plant, WateringHistory, User };

export type PlantWithHistory = Plant & {
  wateringHistory: WateringHistory[];
};

export type CreatePlantData = {
  name: string;
  species?: string;
  wateringFrequencyDays: number;
  notes?: string;
  imageUrl?: string;
};

export type UpdatePlantData = Partial<CreatePlantData>;

export type CreateWateringData = {
  plantId: number;
  notes?: string;
};

export type PlantStatus = {
  id: string;
  name: string;
  species?: string;
  lastWatered?: Date;
  wateringFrequencyDays: number;
  profileImageUrl?: string;
  daysUntilNextWatering: number;
  isOverdue: boolean;
  daysSinceWatered?: number;
};
