<template>
  <div>
    <button
      @click="openModal"
      class="btn btn-primary w-full"
      :disabled="isModalOpen">
      <Icon name="akar-icons:camera" size="24" />
      Foto
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <Modal
        v-if="isModalOpen"
        @close="closeModal"
        title="Foto aufnehmen"
        icon-name="akar-icons:camera"
        :max-width="'4xl'">
        <template #body>
          <!-- Camera / Photo Preview -->
          <div class="p-6 border-b border-base-300">
            <div class="mb-6">
              <div class="flex justify-center">
                <div class="relative">
                  <!-- Camera Video (when streaming) -->
                  <video
                    v-if="!lastTakenPhoto"
                    ref="videoElement"
                    autoplay
                    playsinline
                    muted
                    :class="[
                      'rounded-lg shadow-lg max-w-full h-auto bg-black',
                      { hidden: !isStreaming },
                    ]"
                    class="max-w-lg w-full"></video>

                  <!-- Photo Preview (after taking photo) -->
                  <div v-if="lastTakenPhoto" class="relative max-w-lg w-full">
                    <img
                      :src="lastTakenPhoto.dataUrl"
                      alt="Captured Photo"
                      class="w-full h-auto rounded-lg shadow-lg" />

                    <!-- Photo info overlay -->
                    <div class="absolute top-3 left-3">
                      <div
                        class="bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm">
                        Foto aufgenommen
                      </div>
                    </div>
                  </div>

                  <!-- Placeholder when not streaming and no photo -->
                  <div
                    v-if="!isStreaming && !lastTakenPhoto"
                    class="card bg-base-200 shadow-lg w-full max-w-lg">
                    <div class="card-body items-center text-center py-16">
                      <Icon
                        name="mdi:camera-off"
                        size="56"
                        class="text-base-content opacity-50 mb-4" />
                      <p class="text-base-content opacity-70">
                        Klicke auf "Kamera starten" um zu beginnen
                      </p>
                    </div>
                  </div>

                  <!-- Live indicator (only when streaming) -->
                  <div
                    v-if="isStreaming && !lastTakenPhoto"
                    class="absolute top-3 left-3">
                    <div
                      class="flex items-center gap-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-lg text-sm">
                      <div
                        class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Live
                    </div>
                  </div>
                </div>
              </div>

              <canvas ref="canvasElement" class="hidden"></canvas>
            </div>
            <!-- Error -->
            <div v-if="error" class="p-6">
              <div class="alert alert-error">
                <Icon name="mdi:alert-circle" class="w-5 h-5" />
                <span>{{ error }}</span>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <!-- Camera Controls -->
          <div class="flex w-full justify-between items-center gap-2">
            <!-- Take Photo Button (when streaming) -->
            <button
              v-if="isStreaming && !lastTakenPhoto"
              @click="takePhoto"
              class="btn btn-primary gap-2 w-full">
              <Icon name="mdi:camera" class="w-5 h-5" />
              Foto aufnehmen
            </button>

            <!-- Photo Review Controls (after taking photo) -->
            <template v-if="lastTakenPhoto">
              <button @click="retakePhoto" class="btn btn-outline gap-2">
                <Icon name="mdi:camera-retake" class="w-5 h-5" />
                Erneut aufnehmen
              </button>
            </template>

            <!-- Start Camera Button -->
            <button
              v-if="!isStreaming && !lastTakenPhoto"
              @click="startCamera"
              class="btn btn-success gap-2 w-full">
              <Icon name="mdi:camera" class="w-5 h-5" />
              Kamera starten
            </button>

            <!-- Confirm Photo Button -->
            <button
              v-if="lastTakenPhoto"
              @click="confirmSelection"
              :disabled="!selectedPhoto || isUploading"
              class="btn btn-primary gap-2"
              :class="{ 'btn-disabled': !selectedPhoto || isUploading }">
              <span v-if="isUploading" class="loading loading-spinner loading-sm"></span>
              <Icon v-else name="mdi:check" class="w-5 h-5" />
              {{ isUploading ? (props.plantId ? 'Uploading & Watering...' : 'Uploading...') : 'Speichern' }}
            </button>
          </div>
        </template>
      </Modal>
    </Teleport>

    <!-- Selected Photo Preview (outside modal) -->
    <div v-if="confirmedPhoto" class="mt-6">
      <div class="card bg-success text-success-content shadow-lg">
        <div class="card-body">
          <h3 class="card-title gap-2">
            <Icon name="mdi:check-circle" class="w-6 h-6" />
            Foto ausgewählt!
          </h3>

          <div class="flex flex-col sm:flex-row gap-4 items-start">
            <div class="avatar">
              <div class="w-24 rounded">
                <img :src="confirmedPhoto.dataUrl" alt="Ausgewähltes Foto" />
              </div>
            </div>

            <div class="flex-1">
              <p class="opacity-90 mb-3">
                Das Foto wurde erfolgreich ausgewählt und kann jetzt verwendet
                werden.
              </p>

              <div class="card-actions">
                <button @click="clearSelection" class="btn btn-outline">
                  <Icon name="mdi:trash-can" class="w-4 h-4" />
                  Auswahl löschen
                </button>

                <a
                  :href="confirmedPhoto.dataUrl"
                  :download="`foto-${confirmedPhoto.timestamp}.png`"
                  class="btn btn-outline gap-2">
                  <Icon name="mdi:download" class="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch, nextTick } from "vue";
import Modal from "./Modal.vue";

const props = defineProps({
  plantId: {
    type: String,
    required: false
  }
});

const emit = defineEmits(["photoSelected", "modalClosed", "plantWatered"]);

const isModalOpen = ref(false);
const videoElement = ref(null);
const canvasElement = ref(null);
const isStreaming = ref(false);
const error = ref("");
const selectedPhoto = ref(null);
const confirmedPhoto = ref(null);
const currentStream = ref(null);
const lastTakenPhoto = ref(null);
const isUploading = ref(false);

// Modal
const openModal = async () => {
  isModalOpen.value = true;
  error.value = "";
  lastTakenPhoto.value = null; // Reset photo preview
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  stopCamera();
  isModalOpen.value = false;
  selectedPhoto.value = null;
  lastTakenPhoto.value = null; // Reset photo preview
  error.value = "";
  document.body.style.overflow = "auto";
  emit("modalClosed");
};

const handleEscape = (e) => {
  if (e.key === "Escape" && isModalOpen.value) {
    closeModal();
  }
};

watch(isModalOpen, (newVal) => {
  if (newVal) {
    document.addEventListener("keydown", handleEscape);
  } else {
    document.removeEventListener("keydown", handleEscape);
  }
});

// Camera - Only rear camera
const startCamera = async () => {
  try {
    error.value = "";
    lastTakenPhoto.value = null; // Clear any previous photo preview

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("getUserMedia wird von diesem Browser nicht unterstützt");
    }

    const constraints = {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode: "environment", // Always use rear camera
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream.value = stream;

    await nextTick();

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      isStreaming.value = true;
      console.log("Rear camera started successfully");
    } else {
      console.error("Video element not found");
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("Video element not available");
    }
  } catch (err) {
    console.error("Fehler beim Starten der Kamera:", err);
    error.value = getErrorMessage(err);
  }
};

const takePhoto = () => {
  if (!isStreaming.value || !videoElement.value || !canvasElement.value) return;

  const video = videoElement.value;
  const canvas = canvasElement.value;
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // No mirroring needed for rear camera
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/png", 0.9);

  const newPhoto = {
    dataUrl,
    timestamp: new Date().toISOString().replace(/[:.]/g, "-"),
    id: Date.now(),
  };

  // ✅ Set as preview photo and stop camera
  lastTakenPhoto.value = newPhoto;
  selectedPhoto.value = newPhoto;
  stopCamera();
};

// ✅ New: Retake photo - restart camera and clear preview
const retakePhoto = async () => {
  lastTakenPhoto.value = null;
  await startCamera();
};

const confirmSelection = async () => {
  if (!selectedPhoto.value) return;

  // If plantId is provided, upload the image and create a watering record
  if (props.plantId) {
    await uploadPhotoAndWaterPlant();
  } else {
    // Just emit the photo for other use cases
    confirmedPhoto.value = selectedPhoto.value;
    emit("photoSelected", selectedPhoto.value);
    closeModal();
  }
};

const uploadPhotoAndWaterPlant = async () => {
  if (!selectedPhoto.value || !props.plantId) return;
  
  isUploading.value = true;
  error.value = "";
  
  try {
    // Convert base64 to File
    const file = await dataUrlToFile(selectedPhoto.value.dataUrl, `plant-photo-${selectedPhoto.value.timestamp}.png`);
    
    // Create form data
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('notes', 'Photo taken with camera');
    
    // Upload to watering endpoint
    const response = await $fetch(`/api/plants/${props.plantId}/water`, {
      method: 'POST',
      body: formData
    });
    
    if (response.success) {
      // Emit success events
      emit("plantWatered", {
        plantId: props.plantId,
        imageUrl: response.data.watering.imageUrl,
        wateringRecord: response.data.watering,
        updatedPlant: response.data.plant
      });
      
      // Also emit the photo for backward compatibility
      emit("photoSelected", {
        ...selectedPhoto.value,
        serverUrl: response.data.watering.imageUrl
      });
      
      confirmedPhoto.value = selectedPhoto.value;
      closeModal();
    }
  } catch (err) {
    console.error('Error uploading photo and watering plant:', err);
    error.value = "Failed to save photo and water plant. Please try again.";
  } finally {
    isUploading.value = false;
  }
};

// Helper function to convert base64 data URL to File object
const dataUrlToFile = (dataUrl, filename) => {
  return new Promise((resolve) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    resolve(new File([u8arr], filename, { type: mime }));
  });
};

const clearSelection = () => {
  confirmedPhoto.value = null;
};

const stopCamera = () => {
  if (currentStream.value) {
    currentStream.value.getTracks().forEach((track) => track.stop());
    currentStream.value = null;
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }

  isStreaming.value = false;
};

const getErrorMessage = (err) => {
  switch (err.name) {
    case "NotAllowedError":
      return "Kamera-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.";
    case "NotFoundError":
      return "Keine Kamera gefunden.";
    case "NotReadableError":
      return "Kamera wird bereits von einer anderen Anwendung verwendet.";
    case "OverconstrainedError":
      return "Die angeforderte Kamera-Konfiguration wird nicht unterstützt.";
    case "SecurityError":
      return "Sicherheitsfehler: HTTPS ist für den Kamera-Zugriff erforderlich.";
    default:
      return `Kamera-Fehler: ${err.message}`;
  }
};

// Cleanup
onUnmounted(() => {
  stopCamera();
  document.body.style.overflow = "auto";
  document.removeEventListener("keydown", handleEscape);
});
</script>
