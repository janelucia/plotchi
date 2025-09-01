<template>
  <article
    class="group relative bg-white rounded-2xl border border-gray-200 transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden">
    <div
      @click="$router.push(`/plant/${plant.id}`)"
      class="relative aspect-[5/3] overflow-hidden">
      <NuxtImg
        v-if="plant.profileImageUrl"
        :src="plant.profileImageUrl"
        :alt="plant.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <NuxtImg
          src="/images/plant-placeholder.png"
          alt="Plant Placeholder"
          class="opacity-60 object-cover" />
      </div>

      <div class="absolute top-3 left-3">
        <StatusBadge :statusConfig="statusConfig" />
      </div>
    </div>

    <div class="p-4 flex flex-col gap-3">
      <header
        @click="$router.push(`/plant/${plant.id}`)"
        class="flex flex-col gap-1">
        <h2
          class="text-lg font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors duration-200">
          {{ plant.name }}
        </h2>
        <p class="text-sm text-gray-500">
          {{ plant.species || "Unknown species" }}
        </p>
      </header>

      <div
        @click="$router.push(`/plant/${plant.id}`)"
        class="flex flex-col gap-3">
        <div class="p-3 rounded-xl" :class="urgencyMessage.bgClass">
          <div class="flex items-center gap-2">
            <div class="flex-shrink-0">
              <Icon
                :name="urgencyMessage.icon"
                :class="urgencyMessage.iconColor"
                size="20" />
            </div>
            <div class="flex-1 min-w-0 flex flex-col">
              <p
                class="text-sm font-semibold"
                :class="urgencyMessage.textColor">
                {{ urgencyMessage.title }}
              </p>
              <p class="text-xs" :class="urgencyMessage.subtextColor">
                {{ urgencyMessage.subtitle }}
              </p>
            </div>
          </div>
        </div>

        <PlantStats :plant="plant" variant="default" />
      </div>

      <button
        @click="isModalOpen = true"
        class="btn w-full transition-all duration-200 transform focus:outline-none focus:ring-4 focus:ring-opacity-20"
        :class="[
          wateredToday
            ? 'btn-ghost !bg-gray-100 !text-gray-400 cursor-not-allowed'
            : buttonConfig.class,
          props.loading
            ? 'scale-95 opacity-80'
            : 'hover:scale-[1.02] active:scale-[0.98]',
        ]">
        <Icon name="mdi:watering-can" size="24" />
        <span class="ml-2">
          {{ wateredToday ? "Already watered today" : buttonConfig.text }}
        </span>
      </button>

      <Teleport to="body">
        <Modal
          v-if="isModalOpen"
          :title="`Water ${plant.name}`"
          icon-name="mdi:watering-can"
          @close="isModalOpen = false">
          <template #body>
            <div class="text-center p-4">
              <p class="text-gray-600">
                Direkt gießen oder durch ein Foto dokumentieren?
              </p>
            </div>
          </template>
          <template #footer>
            <div class="flex justify-between gap-2">
              <button
                @click="handleWaterClick"
                :disabled="loading"
                class="btn transition-all duration-200 transform focus:outline-none focus:ring-4 focus:ring-opacity-20 disabled:cursor-not-allowed"
                :class="[
                  wateredToday
                    ? 'w-full btn-ghost !bg-gray-100 !text-gray-400 cursor-not-allowed'
                    : buttonConfig.class,
                  loading
                    ? 'scale-95 opacity-80'
                    : 'hover:scale-[1.02] active:scale-[0.98]',
                ]">
                <div
                  v-if="loading"
                  class="flex items-center justify-center gap-2">
                  <svg
                    class="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-sm">Recording...</span>
                </div>

                <div
                  v-else
                  class="flex w-full items-center justify-center gap-2">
                  <Icon name="mdi:watering-can" size="24" />
                  <p class="text-sm">
                    {{
                      wateredToday ? "Already watered today" : buttonConfig.text
                    }}
                  </p>
                </div>
              </button>

              <CameraModal
                v-if="!selectedImage && !wateredToday"
                :plant-id="plant.id"
                @photoSelected="handlePhotoFromCamera"
                @plantWatered="handlePlantWatered" />
            </div>
          </template>
        </Modal>
      </Teleport>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Plant } from "@prisma/client";
import { PlantStatusHelper } from "@/helpers/plantStatus";
import CameraModal from "~/components/ui/CameraModal.vue";
import StatusBadge from "./ui/StatusBadge.vue";
import PlantStats from "./ui/PlantStats.vue";
import { Teleport } from "vue";
import Modal from "./ui/Modal.vue";

interface Props {
  plant: Plant;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  water: [plantId: string, imageUrl?: string];
}>();

const statusConfig = computed(() =>
  PlantStatusHelper.getStatusConfig(props.plant),
);
const buttonConfig = computed(() => ({
  text: statusConfig.value.buttonText,
  class: statusConfig.value.buttonClass,
}));
const urgencyMessage = computed(() =>
  PlantStatusHelper.getUrgencyMessage(props.plant),
);
const selectedImage = ref<string>("");
const selectedFile = ref<File | null>(null);

const isModalOpen = ref(false);

const handlePhotoFromCamera = (photo: {
  dataUrl: string;
  timestamp: string;
  id: number;
}) => {
  selectedImage.value = photo.dataUrl;

  const dataUrlParts = photo.dataUrl.split(",");
  if (dataUrlParts.length >= 2 && dataUrlParts[1]) {
    const byteString = atob(dataUrlParts[1]);
    const mimeMatch = dataUrlParts[0]?.match(/:(.*?);/);
    const mimeString = mimeMatch?.[1] || "image/png";
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    selectedFile.value = new File([ab], `photo-${photo.timestamp}.png`, {
      type: mimeString,
    });
  }
};

const handleWaterClick = async () => {
  if (props.loading || wateredToday.value) return;

  emit("water", props.plant.id);
};

const handlePlantWatered = (wateringData: {
  plantId: string;
  imageUrl: string;
  wateringRecord: any;
  updatedPlant: any;
}) => {
  // Close the modal
  isModalOpen.value = false;
  
  // Emit the water event with the image URL from the server
  emit("water", wateringData.plantId, wateringData.imageUrl);
};

const wateredToday = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  const todayWatered =
    props.plant.lastWatered?.toISOString().split("T")[0] === today;
  console.log("Watered Today:", todayWatered);
  return todayWatered;
});
</script>
