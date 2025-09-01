<template>
  <div class="flex flex-col gap-8">
    <div class="text-center flex flex-col items-center gap-4">
      <div
        class="bg-primary text-primary-content w-20 h-20 flex items-center justify-center rounded-full">
        <Icon :name="icon" size="54" />
      </div>
      <div class="flex flex-col gap-3">
        <h2 class="text-3xl font-bold">{{ title }}</h2>
        <p v-if="subtitle" class="text-base-content/70 text-lg leading-relaxed">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  icon: string;
}>();
</script>
