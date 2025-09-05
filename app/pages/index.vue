<template>
  <main class="min-h-screen bg-gray-50">
    <AppHeader
      :showStats="true"
      :healthyPlants="healthyPlantsCount"
      :urgentPlants="urgentPlantsCount">
      <template #actions>
        <button @click="$router.push('/plants/new')" class="btn btn-primary">
          <Icon name="mdi:plus" class="w-4 h-4" />
          <span class="hidden sm:inline">Add Plant</span>
        </button>
      </template>
    </AppHeader>

    <section class="flex-1">
      <div class="max-w-7xl mx-auto p-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex items-center">
            <div
              class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span class="text-gray-600">Loading plants...</span>
          </div>
        </div>

        <div
          v-else-if="plants.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PlantCard
            v-for="plant in plants"
            :key="plant.id"
            :plant="plant"
            :loading="wateringPlantId === plant.id"
            @water="(id, imageUrl) => waterPlant(id, imageUrl)" />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="flex flex-col items-center justify-center h-64 gap-4">
          <div
            class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Icon name="mdi:leaf" class="text-emerald-700" size="32" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">No plants yet</h3>
          <p class="text-gray-500 mt-2">
            Add your first plant to start tracking care schedules
          </p>
          <button @click="$router.push('/plants/new')" class="btn btn-primary">
            <Icon name="mdi:plus" class="w-4 h-4" />

            <span class="hidden sm:inline">Add Plant</span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Plant } from "@prisma/client";

definePageMeta({
  middleware: "auth",
});

const { requireAuth } = useAuth();

const wateringPlantId = ref<string | null>(null);

const {
  plants,
  loading,
  fetchPlants,
  waterPlant: waterPlantAction,
} = usePlants();

onMounted(async () => {
  await requireAuth();
  fetchPlants();
});

const waterPlant = async (id: string, imageUrl?: string) => {
  if (!id || wateringPlantId.value) return;

  wateringPlantId.value = id;

  try {
    await waterPlantAction(id, undefined, imageUrl);
  } catch (error: any) {
    console.error("Failed to water plant:", error);
  } finally {
    wateringPlantId.value = null;
  }
};

const urgentPlantsCount = computed(() => {
  const now = new Date();
  return plants.value.filter((plant: Plant) => {
    if (!plant.lastWatered) return true; // Never watered
    const lastWatered = new Date(plant.lastWatered);
    const nextWateringTime =
      lastWatered.getTime() + plant.wateringFrequencyDays * 24 * 60 * 60 * 1000;
    return now.getTime() > nextWateringTime; // Overdue
  }).length;
});

const healthyPlantsCount = computed(() => {
  return plants.value.length - urgentPlantsCount.value;
});
</script>
