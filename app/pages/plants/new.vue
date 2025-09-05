<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
    <AppHeader
      :show-back-button="currentStep > 0"
      :show-add-button="false"
      :show-breadcrumb="true"
      breadcrumb-title="Add New Plant"
      @router-back="handleBackNavigation">
      <template #actions>
        <button @click="$router.push('/')" class="btn btn-ghost">
          <Icon name="mdi:close" class="w-4 h-4" />
          <span class="hidden sm:inline">Cancel</span>
        </button>
      </template>
    </AppHeader>

    <!-- Progress Indicator -->
    <div class="max-w-2xl mx-auto px-6 flex flex-col gap-8 pt-8">
      <div class="steps steps-horizontal w-full">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step"
          :class="{ 'step-primary': index <= currentStep }"
          :data-content="index < currentStep ? '✓' : index + 1">
          {{ step.title }}
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="max-w-2xl mx-auto px-4 flex flex-col py-8 pb-28">
      <!-- Step 0: Welcome & Plant Name -->
      <OnboardingView
        v-if="currentStep === 0"
        key="step-0"
        title="Let's add your new plant friend!"
        subtitle="First, what would you like to call your plant?"
        icon="mdi:plant-outline">
        <div class="flex flex-col gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Plant Name</span>
            </label>
            <input
              v-model="plantData.name"
              type="text"
              placeholder="e.g., Sunny the Sunflower, Green Friend..."
              class="input input-bordered input-lg w-full focus:input-primary"
              @keyup.enter="nextStep" />
          </div>
        </div>
      </OnboardingView>

      <!-- Step 1: Plant Details -->
      <OnboardingView
        v-else-if="currentStep === 1"
        key="step-1"
        :title="`Tell us about ${plantData.name || 'your plant'} 🌿`"
        icon="mdi:leaf">
        <div class="flex flex-col gap-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">
                Plant Species (Optional)
              </span>
            </label>
            <input
              v-model="plantData.species"
              type="text"
              placeholder="e.g., Monstera Deliciosa, Snake Plant, Fiddle Leaf Fig..."
              class="input input-bordered input-lg w-full focus:input-primary"
              @keyup.enter="nextStep" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Location (Optional)</span>
            </label>
            <input
              v-model="plantData.location"
              type="text"
              placeholder="e.g., Living Room, Kitchen Window, Bedroom..."
              class="input input-bordered input-lg w-full focus:input-primary"
              @keyup.enter="nextStep" />
          </div>

          <!-- Popular Plants Suggestions -->
          <div class="divider">Popular plant choices</div>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="species in popularSpecies"
              :key="species"
              @click="plantData.species = species"
              class="btn btn-outline"
              :class="plantData.species === species ? 'btn-secondary' : ''">
              {{ species }}
            </button>
          </div>

          <!-- Popular Location Suggestions -->
          <div class="divider">Popular locations</div>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="location in popularLocations"
              :key="location"
              @click="plantData.location = location"
              class="btn btn-outline"
              :class="plantData.location === location ? 'btn-secondary' : ''">
              {{ location }}
            </button>
          </div>
        </div>
      </OnboardingView>

      <!-- Step 2: Care Schedule -->
      <OnboardingView
        v-else-if="currentStep === 2"
        key="step-2"
        :title="`${plantData.name || 'your plant'} care schedule 💧`"
        :subtitle="`How often does ${
          plantData.name || 'Your plant'
        } need watering?`"
        icon="mdi:calendar">
        <div class="flex flex-col gap-6">
          <!-- Watering Frequency Slider -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Watering Frequency</span>
            </label>
            <div class="bg-base-200 rounded-2xl p-6 flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-accent-content">
                  Every {{ plantData.wateringFrequencyDays }} day{{
                    plantData.wateringFrequencyDays === 1 ? "" : "s"
                  }}
                </span>
                <div
                  class="badge badge-accent badge-outline px-3 py-2 whitespace-nowrap">
                  {{ getWateringDescription() }}
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <input
                  v-model.number="plantData.wateringFrequencyDays"
                  type="range"
                  min="1"
                  max="30"
                  class="range range-accent" />

                <div class="flex w-full justify-between px-2 text-xs">
                  <span>Daily</span>
                  <span>Weekly</span>
                  <span>Monthly</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Common Watering Schedules -->
          <div class="divider">Quick presets</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="preset in wateringPresets"
              :key="preset.days"
              @click="plantData.wateringFrequencyDays = preset.days"
              class="btn btn-outline flex-col h-auto py-4"
              :class="
                plantData.wateringFrequencyDays === preset.days
                  ? 'btn-accent'
                  : ''
              ">
              <span class="text-2xl mb-1">{{ preset.emoji }}</span>
              <span class="text-xs">{{ preset.label }}</span>
            </button>
          </div>
        </div>
      </OnboardingView>

      <!-- Step 3: Plant Photo -->
      <OnboardingView
        v-else-if="currentStep === 3"
        key="step-3-photo"
        :title="`Add a photo of ${plantData.name || 'your plant'} 📸`"
        subtitle="Capture your plant's first moment or skip for now"
        icon="mdi:camera-outline">
        <div class="flex flex-col gap-6">
          <CameraModal @photo-selected="handlePhotoSelected" />

          <div
            v-if="plantData.imageUrl"
            class="rounded-xl overflow-hidden bg-base-200 w-32 h-32 mx-auto">
            <img
              :src="plantData.imageUrl"
              alt="Plant photo preview"
              class="w-full h-full object-cover" />
          </div>

          <div class="divider">Optional</div>

          <button @click="skipPhoto" class="btn btn-ghost gap-2">
            <Icon name="mdi:skip-next" />
            Skip photo for now
          </button>
        </div>
      </OnboardingView>

      <!-- Step 4: Final Review -->
      <OnboardingView
        v-else-if="currentStep === 4"
        key="step-4-review"
        title="Almost done! 🪴"
        :subtitle="`Check if everything looks good for ${
          plantData.name || 'your plant'
        }'s profile.`"
        icon="mdi:check-circle-outline">
        <div class="flex flex-col gap-8">
          <!-- Plant Photo Preview -->
          <div v-if="plantData.imageUrl" class="flex flex-col gap-3">
            <span class="font-semibold text-base-content/70">Photo:</span>
            <div
              class="rounded-xl overflow-hidden bg-base-200 w-32 h-32 mx-auto">
              <img
                :src="plantData.imageUrl"
                :alt="`${plantData.name} photo`"
                class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Summary Card -->
          <div class="flex flex-col gap-2">
            <div class="flex justify-between">
              <span class="text-base-content/70">Name:</span>
              <span class="font-medium">{{ plantData.name || "Not set" }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/70">Species:</span>
              <span class="font-medium">
                {{ plantData.species || "Not specified" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/70">Location:</span>
              <span class="font-medium">
                {{ plantData.location || "Not specified" }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/70">Watering:</span>
              <span class="font-medium">
                Every {{ plantData.wateringFrequencyDays }} day{{
                  plantData.wateringFrequencyDays === 1 ? "" : "s"
                }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/70">Photo:</span>
              <span class="font-medium">
                {{ plantData.imageUrl ? "Added" : "None" }}
              </span>
            </div>
          </div>
        </div>
      </OnboardingView>

      <!-- Navigation Footer -->
      <div
        class="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-50">
        <div
          class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <button
              v-if="currentStep > 0"
              @click="previousStep"
              class="btn btn-ghost flex items-center gap-2">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button
              v-if="currentStep < steps.length - 1"
              @click="nextStep"
              :disabled="!canProceed"
              class="btn btn-primary flex items-center gap-2">
              Next
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
            <button
              v-else
              @click="submitPlant"
              :disabled="!canProceed || isSubmitting"
              class="btn btn-success flex items-center gap-2">
              <span
                v-if="isSubmitting"
                class="loading loading-spinner loading-sm"></span>
              {{ isSubmitting ? "Creating..." : "Create Plant" }}
              <svg
                v-if="!isSubmitting"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OnboardingView from "~/components/ui/OnboardingView.vue";
import CameraModal from "~/components/ui/CameraModal.vue";

type PlantData = {
  name: string;
  species: string;
  location: string;
  wateringFrequencyDays: number;
  notes: string;
  imageUrl: string | null;
};

type Step = {
  title: string;
  key: string;
};

// Reactive data
const currentStep = ref(0);
const isSubmitting = ref(false);

const plantData = reactive<PlantData>({
  name: "",
  species: "",
  location: "",
  wateringFrequencyDays: 7,
  notes: "",
  imageUrl: null,
});

// Steps configuration
const steps: Step[] = [
  { title: "Welcome", key: "welcome" },
  { title: "Details", key: "details" },
  { title: "Care", key: "schedule" },
  { title: "Photo", key: "photo" },
  { title: "Review", key: "finish" },
];

// Popular species suggestions
const popularSpecies = [
  "Snake Plant",
  "Pothos",
  "Monstera",
  "Fiddle Leaf Fig",
  "Peace Lily",
  "Spider Plant",
  "Rubber Plant",
  "Aloe Vera",
];

// Popular location suggestions
const popularLocations = [
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Office",
  "Balcony",
];

// Watering frequency presets
const wateringPresets = [
  { days: 1, label: "Daily", emoji: "💧" },
  { days: 3, label: "3 Days", emoji: "🌿" },
  { days: 7, label: "Weekly", emoji: "📅" },
  { days: 14, label: "Bi-weekly", emoji: "🌱" },
];

// Computed properties
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return plantData.name.trim().length > 0;
    case 1:
      return true; // Species is optional
    case 2:
      return plantData.wateringFrequencyDays > 0;
    case 3:
      return true; // Photo is optional
    case 4:
      return true; // Review step
    default:
      return false;
  }
});

// Methods
function getWateringDescription() {
  const days = plantData.wateringFrequencyDays;
  if (days === 1) return "Very thirsty!";
  if (days <= 3) return "Frequent";
  if (days <= 7) return "Regular";
  if (days <= 14) return "Moderate";
  return "Low maintenance";
}

function nextStep() {
  if (canProceed.value && currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function handleBackNavigation() {
  if (currentStep.value > 0) {
    previousStep();
  } else {
    navigateTo("/");
  }
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
      plantData.imageUrl = uploadResponse.data.imageUrl;
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Error uploading photo:", error);
    alert("Failed to upload photo. Please try again.");
  }
}

function skipPhoto() {
  plantData.imageUrl = null;
  nextStep();
}

async function submitPlant() {
  if (!canProceed.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const plantPayload = {
      name: plantData.name,
      species: plantData.species || undefined,
      wateringFrequencyDays: plantData.wateringFrequencyDays,
      notes: plantData.notes || undefined,
      imageUrl: plantData.imageUrl || undefined,
    };

    console.log("Submitting plant data:", plantPayload);

    const response = await $fetch<{
      success: boolean;
      data: any;
    }>("/api/plants", {
      method: "POST",
      body: plantPayload,
    });

    if (response.success) {
      console.log("Plant created successfully:", response.data);

      await navigateTo("/");
    } else {
      throw new Error("Failed to create plant");
    }
  } catch (error: any) {
    console.error("Failed to create plant:", error);

    // Handle specific error messages
    let errorMessage = "Failed to create plant. Please try again.";

    if (error?.data?.statusMessage) {
      errorMessage = error.data.statusMessage;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Show error to user
    alert(errorMessage); // Replace with your preferred error handling
  } finally {
    isSubmitting.value = false;
  }
}

// Handle keyboard navigation
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && canProceed.value) {
      if (currentStep.value < steps.length - 1) {
        nextStep();
      } else {
        submitPlant();
      }
    }
  };

  document.addEventListener("keydown", handleKeydown);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
});
</script>
