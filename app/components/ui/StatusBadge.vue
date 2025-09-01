<template>
  <div
    class="flex items-center px-2 py-1 rounded-full border text-xs font-medium"
    :class="statusConfig.class">
    <div
      class="w-1.5 h-1.5 rounded-full mr-1.5"
      :class="statusConfig.dotClass"></div>
    <span>{{ statusConfig.text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  statusConfig: {
    text: string;
    class: string;
    dotClass: string;
  };
}>();
</script>
