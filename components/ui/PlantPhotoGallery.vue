<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold">Photo Gallery</h3>
      <button @click="openCamera" class="btn btn-primary btn-sm gap-2">
        <Icon name="mdi:camera" />
        Add Photo
      </button>
    </div>

    <!-- Photo Grid -->
    <div v-if="photos.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="aspect-square rounded-xl overflow-hidden bg-base-200 hover:opacity-90 transition-opacity cursor-pointer"
        @click="openPhotoModal(photo)">
        <img
          :src="photo.imageUrl"
          :alt="`${plantName} photo`"
          class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-12 text-center">
      <Icon
        name="mdi:camera-outline"
        class="text-6xl text-base-content/30 mb-4" />
      <h4 class="text-lg font-medium text-base-content/70 mb-2">
        No photos yet
      </h4>
      <p class="text-sm text-base-content/50 mb-6">
        Start building your plant's photo album!
      </p>
      <button @click="openCamera" class="btn btn-primary gap-2">
        <Icon name="mdi:camera" />
        Take First Photo
      </button>
    </div>

    <!-- Camera Modal Integration -->
    <CameraModal
      v-if="showCameraModal"
      @photo-selected="handlePhotoSelected"
      @modal-closed="showCameraModal = false" />

    <!-- Photo View Modal -->
    <dialog ref="photoModal" class="modal">
      <div class="modal-box max-w-2xl" v-if="selectedPhoto">
        <div class="flex justify-between items-start mb-4">
          <h3 class="font-bold text-lg">Photo Details</h3>
          <button
            @click="setAsProfile"
            class="btn btn-sm btn-outline gap-2"
            :class="{
              'btn-success': selectedPhoto.imageUrl === currentProfileImage,
            }">
            <Icon name="mdi:account-circle" />
            {{
              selectedPhoto.imageUrl === currentProfileImage
                ? "Current Profile"
                : "Set as Profile"
            }}
          </button>
        </div>

        <div class="rounded-xl overflow-hidden bg-base-200 mb-4">
          <img
            :src="selectedPhoto.imageUrl"
            :alt="`${plantName} photo`"
            class="w-full max-h-96 object-contain" />
        </div>

        <div class="text-sm text-base-content/70">
          <p>Taken: {{ formatDate(selectedPhoto.createdAt) }}</p>
        </div>

        <div class="modal-action">
          <button @click="closePhotoModal" class="btn">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import CameraModal from "./CameraModal.vue";

interface PlantPhoto {
  id: string;
  plantId: string;
  imageUrl: string;
  createdAt: string;
}

interface PlantPhotoGalleryProps {
  plantId: string;
  plantName: string;
  currentProfileImage?: string | null;
}

const props = defineProps<PlantPhotoGalleryProps>();

const photoModal = ref<HTMLDialogElement>();
const photos = ref<PlantPhoto[]>([]);
const selectedPhoto = ref<PlantPhoto | null>(null);
const isLoading = ref(false);
const showCameraModal = ref(false);

// Load photos on mount
onMounted(() => {
  loadPhotos();
});

async function loadPhotos() {
  try {
    isLoading.value = true;
    const response = await $fetch<{
      success: boolean;
      data: PlantPhoto[];
    }>(`/api/plants/${props.plantId}/photos`);

    if (response.success) {
      photos.value = response.data;
    }
  } catch (error) {
    console.error("Error loading photos:", error);
  } finally {
    isLoading.value = false;
  }
}

function openCamera() {
  showCameraModal.value = true;
}

function openPhotoModal(photo: PlantPhoto) {
  selectedPhoto.value = photo;
  photoModal.value?.showModal();
}

function closePhotoModal() {
  selectedPhoto.value = null;
  photoModal.value?.close();
}

async function handlePhotoSelected(photo: any) {
  try {
    // Convert canvas data URL to blob and upload to server
    const response = await fetch(photo.dataUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("file", blob, `plant-photo-${Date.now()}.png`);

    const uploadResponse = await $fetch<{
      success: boolean;
      data: { imageUrl: string };
    }>("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (uploadResponse.success) {
      // Save photo to plant's gallery
      const saveResponse = await $fetch<{
        success: boolean;
        data: PlantPhoto;
      }>(`/api/plants/${props.plantId}/photos`, {
        method: "POST",
        body: { imageUrl: uploadResponse.data.imageUrl },
      });

      if (saveResponse.success) {
        // Add new photo to the beginning of the array
        photos.value.unshift(saveResponse.data);
        showCameraModal.value = false;
      } else {
        throw new Error("Failed to save photo");
      }
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Error saving photo:", error);
    alert("Failed to save photo. Please try again.");
  }
}

async function setAsProfile() {
  if (!selectedPhoto.value) return;

  try {
    // Update plant's profile image
    const response = await $fetch(`/api/plants/${props.plantId}/photos`, {
      method: "POST",
      body: {
        imageUrl: selectedPhoto.value.imageUrl,
        isProfile: true,
      },
    });

    if (response.success) {
      // Emit event to parent to update profile image
      emit("profile-updated", selectedPhoto.value.imageUrl);
      closePhotoModal();
    }
  } catch (error) {
    console.error("Error setting profile photo:", error);
    alert("Failed to set profile photo. Please try again.");
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const emit = defineEmits<{
  "profile-updated": [imageUrl: string];
}>();
</script>
