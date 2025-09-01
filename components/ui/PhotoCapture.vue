<template>
  <div class="flex flex-col gap-4">
    <!-- Photo Preview -->
    <div v-if="photoUrl" class="flex flex-col gap-4">
      <div class="rounded-xl overflow-hidden bg-base-200">
        <img
          :src="photoUrl"
          alt="Plant photo preview"
          class="w-full h-48 object-cover" />
      </div>
      <div class="flex gap-3">
        <button @click="retakePhoto" class="btn btn-outline flex-1 gap-2">
          <Icon name="mdi:camera-retake" />
          Retake
        </button>
        <button @click="confirmPhoto" class="btn btn-primary flex-1 gap-2">
          <Icon name="mdi:check" />
          Use Photo
        </button>
      </div>
    </div>

    <!-- Camera Interface -->
    <div v-else class="flex flex-col gap-4">
      <!-- File Upload Option -->
      <div class="flex flex-col gap-3">
        <label class="btn btn-primary gap-2 cursor-pointer">
          <Icon name="mdi:camera" />
          Take Photo
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            capture="environment"
            class="hidden"
            @change="handleFileSelect" />
        </label>

        <div class="divider">or</div>

        <label class="btn btn-outline gap-2 cursor-pointer">
          <Icon name="mdi:upload" />
          Upload from Gallery
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect" />
        </label>
      </div>

      <!-- Upload Progress -->
      <div
        v-if="isUploading"
        class="flex items-center gap-3 p-4 bg-base-200 rounded-xl">
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm">Uploading photo...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PhotoCaptureProps {
  modelValue?: string | null;
}

interface PhotoCaptureEmits {
  "update:modelValue": [value: string | null];
  "photo-captured": [imageUrl: string];
}

const props = defineProps<PhotoCaptureProps>();
const emit = defineEmits<PhotoCaptureEmits>();

const fileInput = ref<HTMLInputElement>();
const photoUrl = ref<string | null>(props.modelValue || null);
const isUploading = ref(false);

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    photoUrl.value = newValue || null;
  },
);

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  try {
    isUploading.value = true;

    // Create form data for upload
    const formData = new FormData();
    formData.append("file", file);

    // Upload to server
    const response = await $fetch<{
      success: boolean;
      data: { imageUrl: string };
    }>("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.success) {
      photoUrl.value = response.data.imageUrl;
      emit("update:modelValue", response.data.imageUrl);
      emit("photo-captured", response.data.imageUrl);
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Error uploading photo:", error);
    alert("Failed to upload photo. Please try again.");
  } finally {
    isUploading.value = false;
    // Clear input for potential re-upload
    if (target) {
      target.value = "";
    }
  }
}

function retakePhoto() {
  photoUrl.value = null;
  emit("update:modelValue", null);
}

function confirmPhoto() {
  if (photoUrl.value) {
    emit("photo-captured", photoUrl.value);
  }
}
</script>
