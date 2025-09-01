<template>
  <AppHeader
    :showStats="true"
    :breadcrumbTitle="plant?.name || 'Plant Details'"
    :showBreadcrumb="true">
    <template #actions>
      <button
        @click="handleEdit"
        class="btn btn-accent hover:btn-info transition-all duration-200 tooltip tooltip-bottom"
        data-tip="Edit plant">
        <Icon name="mdi:pencil" class="w-5 h-5" />
        <span class="hidden lg:inline ml-1">Edit</span>
      </button>

      <button
        @click="showDeleteModal = true"
        class="btn btn-secondary hover:btn-error transition-all duration-200 tooltip tooltip-bottom"
        data-tip="Delete plant">
        <Icon name="mdi:trash-can" class="w-5 h-5" />
        <span class="hidden lg:inline ml-1">Delete</span>
      </button>
    </template>
  </AppHeader>

  <div
    v-if="loading || !plant"
    class="flex justify-center items-center min-h-64">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else class="flex flex-col items-center gap-8 p-4 max-w-md mx-auto">
    <div class="w-full">
      <NuxtImg
        :src="plant.profileImageUrl || '/images/plant-placeholder.png'"
        :alt="plant.name"
        class="object-cover rounded-lg" />
    </div>
    <div class="flex gap-2 w-full justify-between">
      <div class="text-left w-full">
        <h1 class="text-2xl font-bold">
          {{ plant.name || "Unknown Plant" }}
        </h1>
        <p class="text-gray-600 mt-2">
          <strong>Species:</strong>
          {{ plant.species || "Unknown Species" }}
        </p>
      </div>
      <div class="h-fit">
        <StatusBadge v-if="statusConfig" :status-config="statusConfig" />
      </div>
    </div>

    <div class="w-full">
      <PlantStats :plant="plant" variant="large" />
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div class="modal" :class="{ 'modal-open': showDeleteModal }">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Delete Plant</h3>
      <p class="py-4">
        Are you sure you want to delete
        <strong>{{ plant?.name }}</strong>
        ? This action cannot be undone and all watering history will be lost.
      </p>
      <div class="modal-action">
        <button
          @click="showDeleteModal = false"
          class="btn btn-ghost"
          :disabled="deletingPlant">
          Cancel
        </button>
        <button
          @click="handleDelete"
          class="btn btn-error"
          :disabled="deletingPlant">
          <span
            v-if="deletingPlant"
            class="loading loading-spinner loading-sm mr-2"></span>
          {{ deletingPlant ? "Deleting..." : "Delete Plant" }}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="showDeleteModal = false"></div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from "~/components/ui/StatusBadge.vue";
import PlantStats from "~/components/ui/PlantStats.vue";
import { PlantStatusHelper } from "@/helpers/plantStatus";

const route = useRoute();
const router = useRouter();
const plantId = route.params.id as string;
const { plants, fetchPlants, loading, deletePlant } = usePlants();

const showDeleteModal = ref(false);
const deletingPlant = ref(false);
const photoCarouselRef = ref();

const plant = computed(() => plants.value.find((p) => p.id === plantId));

const statusConfig = computed(() => {
  if (!plant.value || loading.value) return null;
  return PlantStatusHelper.getStatusConfig(plant.value);
});

const handleEdit = () => {
  router.push(`/plant/${plantId}/edit`);
};

const handleDelete = async () => {
  if (!plant.value || deletingPlant.value) return;

  try {
    deletingPlant.value = true;
    await deletePlant(plant.value.id);

    await router.push("/");
  } catch (error) {
    console.error("Failed to delete plant:", error);
    // Show error message
    // You can add a toast notification here
  } finally {
    deletingPlant.value = false;
    showDeleteModal.value = false;
  }
};

onMounted(async () => {
  if (plants.value.length === 0) {
    await fetchPlants();
  }
});

watchEffect(() => {
  if (!loading.value && plants.value.length > 0 && !plant.value) {
    throw createError({
      statusCode: 404,
      statusMessage: "Plant not found",
    });
  }
});

const handlePhotoDeleted = async () => {
  // Refresh plant data in case profile image changed
  await fetchPlants();
};

const handleProfileImageChanged = async () => {
  // Refresh plant data to get updated profile image
  await fetchPlants();
};
</script>
