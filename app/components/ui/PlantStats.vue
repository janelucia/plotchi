<template>
  <div class="flex bg-base-100 rounded-lg overflow-hidden">
    <div class="flex-1 text-center py-3 px-2">
      <div class="text-xs font-medium text-base-content/70 mb-1">
        Water Cycle
      </div>
      <div class="text-xl font-bold text-primary-content/60">
        {{ plant.wateringFrequencyDays }}
      </div>
      <div class="text-xs text-base-content/60">days</div>
    </div>

    <div
      class="w-px bg-gradient-to-b from-transparent via-base-300 to-transparent"></div>

    <div class="flex-1 text-center py-3 px-2">
      <div class="text-xs font-medium text-base-content/70 mb-1">
        Last Watered
      </div>
      <div class="text-xl font-bold text-primary-content/60">
        {{ daysSinceWatered }}
      </div>
      <div class="text-xs text-base-content/60">{{ daysSinceWateredUnit }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Plant } from "@prisma/client";
import { PlantStatusHelper } from "@/helpers/plantStatus";

type Props = {
  plant: Plant;
  variant?: "default" | "large" | "compact";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
});

const daysSinceWatered = computed(() =>
  PlantStatusHelper.getDaysSinceWatered(props.plant),
);

const daysSinceWateredUnit = computed(() => {
  const days = daysSinceWatered.value;
  if (days === "Never") return "never";
  if (days === "Today") return "today";
  return days === "1" ? "day ago" : "days ago";
});
</script>
