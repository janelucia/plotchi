import type { Plant, PlantWithHistory } from "~/types/database";

export const usePlants = () => {
  // Global state for all plants
  const plants = ref<Plant[]>([]);
  const selectedPlant = ref<PlantWithHistory | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all plants
  const fetchPlants = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/api/plants");
      plants.value = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        species: item.species ?? null,
        wateringFrequencyDays: item.wateringFrequencyDays,
        lastWatered: item.lastWatered ? new Date(item.lastWatered) : null,
        notes: item.notes ?? null,
        profileImageUrl: item.profileImageUrl ?? item.imageUrl ?? null,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        userId: item.userId ?? "",
      }));
      return plants.value;
    } catch (err: any) {
      error.value = err.statusMessage || "Failed to fetch plants";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single plant by ID
  const fetchPlant = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/plants/${id}`);
      selectedPlant.value = {
        ...response.data,
        lastWatered: response.data.lastWatered
          ? new Date(response.data.lastWatered)
          : null,
        createdAt: response.data.createdAt
          ? new Date(response.data.createdAt)
          : new Date(),
        updatedAt: response.data.updatedAt
          ? new Date(response.data.updatedAt)
          : new Date(),
        wateringHistory: response.data.wateringHistory
          ? response.data.wateringHistory.map((history: any) => ({
              ...history,
              wateredAt: history.wateredAt ? new Date(history.wateredAt) : null,
            }))
          : [],
      };
      return selectedPlant.value;
    } catch (err: any) {
      error.value = err.statusMessage || "Failed to fetch plant";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Water a plant
  const waterPlant = async (id: string, notes?: string, imageUrl?: string) => {
    try {
      const response = await $fetch(`/api/plants/${id}/water`, {
        method: "POST",
        body: { notes, imageUrl },
      });

      // Update the plant in the global state if it exists
      const plantIndex = plants.value.findIndex((p) => p.id === id);
      if (plantIndex !== -1) {
        plants.value[plantIndex] = {
          ...response.data.plant,
          lastWatered: response.data.plant.lastWatered
            ? new Date(response.data.plant.lastWatered)
            : null,
          createdAt: response.data.plant.createdAt
            ? new Date(response.data.plant.createdAt)
            : new Date(),
          updatedAt: response.data.plant.updatedAt
            ? new Date(response.data.plant.updatedAt)
            : new Date(),
        };
      }

      // Update selected plant if it's the same one
      if (selectedPlant.value?.id === id) {
        const existingHistory = selectedPlant.value.wateringHistory || [];
        const newWateringRecord = {
          ...response.data.watering,
          wateredAt: response.data.watering.wateredAt
            ? new Date(response.data.watering.wateredAt)
            : new Date(),
        };

        selectedPlant.value = {
          ...selectedPlant.value,
          ...response.data.plant,
          lastWatered: response.data.plant.lastWatered
            ? new Date(response.data.plant.lastWatered)
            : null,
          createdAt: response.data.plant.createdAt
            ? new Date(response.data.plant.createdAt)
            : new Date(),
          updatedAt: response.data.plant.updatedAt
            ? new Date(response.data.plant.updatedAt)
            : new Date(),
          // Add the new watering record to the beginning of the history
          wateringHistory: [newWateringRecord, ...existingHistory],
        };
      }

      return response;
    } catch (err: any) {
      error.value = err.statusMessage || "Failed to water plant";
      throw err;
    }
  };

  // Delete a plant
  const deletePlant = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/plants/${id}`, {
        method: "DELETE",
      });

      // Remove plant from global state
      plants.value = plants.value.filter((plant) => plant.id !== id);

      // Clear selected plant if it's the one being deleted
      if (selectedPlant.value?.id === id) {
        selectedPlant.value = null;
      }

      return response;
    } catch (err: any) {
      error.value = err.statusMessage || "Failed to delete plant";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update a plant
  const updatePlant = async (
    id: string,
    updateData: {
      name?: string;
      species?: string | null;
      wateringFrequencyDays?: number;
      notes?: string | null;
    },
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/plants/${id}`, {
        method: "PUT",
        body: updateData,
      });

      // Update plant in global state
      const plantIndex = plants.value.findIndex((p) => p.id === id);
      if (plantIndex !== -1) {
        plants.value[plantIndex] = {
          ...plants.value[plantIndex],
          ...response.data,
          lastWatered: response.data.lastWatered
            ? new Date(response.data.lastWatered)
            : null,
          createdAt: response.data.createdAt
            ? new Date(response.data.createdAt)
            : new Date(),
          updatedAt: response.data.updatedAt
            ? new Date(response.data.updatedAt)
            : new Date(),
        };
      }

      // Update selected plant if it's the same one
      if (selectedPlant.value?.id === id) {
        selectedPlant.value = {
          ...selectedPlant.value,
          ...response.data,
          lastWatered: response.data.lastWatered
            ? new Date(response.data.lastWatered)
            : null,
          createdAt: response.data.createdAt
            ? new Date(response.data.createdAt)
            : new Date(),
          updatedAt: response.data.updatedAt
            ? new Date(response.data.updatedAt)
            : new Date(),
        };
      }

      return response;
    } catch (err: any) {
      error.value = err.statusMessage || "Failed to update plant";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get a plant by ID from the global state (without API call)
  const getPlantById = (id: string): Plant | undefined => {
    return plants.value.find((plant) => plant.id === id);
  };

  return {
    // State
    plants: readonly(plants),
    selectedPlant: readonly(selectedPlant),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    fetchPlants,
    fetchPlant,
    waterPlant,
    deletePlant,
    updatePlant,
    getPlantById,
  };
};
