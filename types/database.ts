import type { Plant, WateringHistory } from "@prisma/client";

export type { Plant, WateringHistory };

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
  plantId: string;
  notes?: string;
  imageUrl?: string;
};

export type CreateWateringWithPhotoData = {
  plantId: string;
  notes?: string;
  photo?: File | Blob;
};

export type PlantStatus = {
  id: string;
  name: string;
  species?: string;
  lastWatered?: Date;
  wateringFrequencyDays: number;
  daysUntilNextWatering: number;
  isOverdue: boolean;
  daysSinceWatered?: number;
};
