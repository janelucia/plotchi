<!-- pages/plant/[id]/edit.vue -->
<template>
  <AppHeader
    :showStats="false"
    :breadcrumbTitle="`Edit ${plant?.name || 'Plant'}`"
    :showBreadcrumb="true">
    <template #actions>
      <button @click="handleCancel" class="btn btn-ghost" :disabled="saving">
        <Icon name="mdi:close" class="w-4 h-4" />
        <span class="hidden sm:inline">Cancel</span>
      </button>

      <button
        @click="handleSubmit"
        class="btn btn-primary"
        :disabled="saving || !isFormValid">
        <span
          v-if="saving"
          class="loading loading-spinner loading-sm mr-1"></span>
        <Icon v-else name="mdi:content-save" class="w-4 h-4" />
        <span class="hidden sm:inline">
          {{ saving ? "Saving..." : "Save" }}
        </span>
      </button>
    </template>
  </AppHeader>

  <div
    v-if="loading || !plant"
    class="flex justify-center items-center min-h-64">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-6 md:py-12">
      <div class="max-w-lg mx-auto">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Plant Name -->
          <div class="form-control">
            <label class="label pb-2">
              <span class="label-text text-base font-semibold">Plant Name</span>
              <span class="text-error text-sm">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Enter your plant's name"
              class="input input-bordered input-lg w-full focus:input-primary"
              :class="{ 'input-error': errors.name }"
              required />
            <div v-if="errors.name" class="label pt-1">
              <span class="label-text-alt text-error flex items-center gap-1">
                <Icon name="mdi:alert-circle" class="w-4 h-4" />
                {{ errors.name }}
              </span>
            </div>
          </div>

          <!-- Species -->
          <div class="form-control">
            <label class="label pb-2">
              <span class="label-text text-base font-semibold">Species</span>
              <span class="label-text-alt text-base-content/60">Optional</span>
            </label>
            <input
              v-model="formData.species"
              type="text"
              placeholder="e.g., Monstera Deliciosa, Fiddle Leaf Fig"
              class="input input-bordered input-lg w-full focus:input-primary"
              :class="{ 'input-error': errors.species }" />
            <div v-if="errors.species" class="label pt-1">
              <span class="label-text-alt text-error flex items-center gap-1">
                <Icon name="mdi:alert-circle" class="w-4 h-4" />
                {{ errors.species }}
              </span>
            </div>
          </div>

          <!-- Location -->
          <div class="form-control">
            <label class="label pb-2">
              <span class="label-text text-base font-semibold">Location</span>
              <span class="label-text-alt text-base-content/60">Optional</span>
            </label>
            <input
              v-model="formData.location"
              type="text"
              placeholder="e.g., Living Room, Kitchen Window, Bedroom"
              class="input input-bordered input-lg w-full focus:input-primary"
              :class="{ 'input-error': errors.location }" />
            <div v-if="errors.location" class="label pt-1">
              <span class="label-text-alt text-error flex items-center gap-1">
                <Icon name="mdi:alert-circle" class="w-4 h-4" />
                {{ errors.location }}
              </span>
            </div>
          </div>

          <!-- Watering Frequency -->
          <div class="form-control">
            <label class="label pb-2">
              <span class="label-text text-base font-semibold">
                Watering Schedule
              </span>
              <span class="text-error text-sm">*</span>
            </label>
            <select
              v-model.number="formData.wateringFrequencyDays"
              class="select select-bordered select-lg w-full focus:select-primary"
              :class="{ 'select-error': errors.wateringFrequencyDays }"
              required>
              <option value="" disabled>
                How often should this plant be watered?
              </option>
              <option value="1">Every day</option>
              <option value="2">Every 2 days</option>
              <option value="3">Every 3 days</option>
              <option value="7">Once a week</option>
              <option value="10">Every 10 days</option>
              <option value="14">Every 2 weeks</option>
              <option value="21">Every 3 weeks</option>
              <option value="30">Once a month</option>
            </select>
            <div v-if="errors.wateringFrequencyDays" class="label pt-1">
              <span class="label-text-alt text-error flex items-center gap-1">
                <Icon name="mdi:alert-circle" class="w-4 h-4" />
                {{ errors.wateringFrequencyDays }}
              </span>
            </div>
            <div class="label pt-1">
              <span class="label-text-alt text-base-content/60 text-wrap">
                Choose based on your plant's specific needs
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-control">
            <label class="label pb-2">
              <span class="label-text text-base font-semibold">Care Notes</span>
              <span class="label-text-alt text-base-content/60">Optional</span>
            </label>
            <textarea
              v-model="formData.notes"
              class="textarea textarea-bordered textarea-lg w-full focus:textarea-primary min-h-[120px]"
              placeholder="Add any special care instructions, reminders, or notes about this plant..."></textarea>
            <div class="label pt-1">
              <span class="label-text-alt text-base-content/60 text-wrap">
                e.g., "Prefers bright indirect light", "Water when top soil is
                dry"
              </span>
            </div>
          </div>

          <!-- Form Validation Alert -->
          <div v-if="!isFormValid" class="alert alert-warning">
            <Icon name="mdi:alert-circle" class="w-5 h-5" />
            <span>
              Please fill in the required fields to save your changes.
            </span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const plantId = route.params.id as string;
const { plants, fetchPlants, loading, updatePlant } = usePlants();

const saving = ref(false);
const errors = ref<Record<string, string>>({});

const plant = computed(() => plants.value.find((p) => p.id === plantId));

// Form data
const formData = ref({
  name: "",
  species: "",
  location: "",
  wateringFrequencyDays: 7,
  notes: "",
});

// Initialize form with plant data
watchEffect(() => {
  if (plant.value) {
    formData.value = {
      name: plant.value.name || "",
      species: plant.value.species || "",
      location: plant.value.location || "",
      wateringFrequencyDays: plant.value.wateringFrequencyDays || 7,
      notes: plant.value.notes || "",
    };
  }
});

// Form validation
const isFormValid = computed(() => {
  return (
    formData.value.name.trim().length > 0 &&
    formData.value.wateringFrequencyDays > 0
  );
});

const validateForm = () => {
  errors.value = {};

  if (!formData.value.name.trim()) {
    errors.value.name = "Plant name is required";
  }

  if (
    formData.value.wateringFrequencyDays < 1 ||
    formData.value.wateringFrequencyDays > 365
  ) {
    errors.value.wateringFrequencyDays =
      "Watering frequency must be between 1 and 365 days";
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm() || !plant.value || saving.value) return;

  try {
    saving.value = true;

    await updatePlant(plant.value.id, {
      name: formData.value.name.trim(),
      species: formData.value.species.trim() || null,
      wateringFrequencyDays: formData.value.wateringFrequencyDays,
      notes: formData.value.notes.trim() || null,
    });

    await router.push(`/plant/${plantId}`);
  } catch (error) {
    console.error("Failed to update plant:", error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push(`/plant/${plantId}`);
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
</script>
