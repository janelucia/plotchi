<template>
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl max-h-[90vh] p-0 overflow-hidden">
      <div
        class="flex justify-between items-center p-4 border-b border-base-300 bg-base-200">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <Icon :name="iconName" size="24" />
          {{ title }}
        </h2>
        <button @click="closeModal" class="btn btn-circle btn-ghost">
          <Icon name="mdi:close" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="overflow-y-auto max-h-[70vh]">
        <slot name="body" />
      </div>

      <!-- Modal Footer -->
      <div class="p-4 bg-base-200 border-t border-base-300">
        <slot name="footer" />
      </div>
    </div>

    <!-- Modal backdrop (click to close) -->
    <div class="modal-backdrop" @click="closeModal"></div>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits<{
  (e: "close"): void;
}>();

defineProps<{
  title: string;
  iconName: string;
}>();

function closeModal() {
  emit("close");
}
</script>
