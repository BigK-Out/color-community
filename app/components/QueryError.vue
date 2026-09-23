<script setup lang="ts">
defineProps<{ message?: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="query-error" role="alert">
    <p>{{ message ?? 'Something went wrong loading this.' }}</p>
    <button class="btn btn--plain" @click="$emit('retry')">Retry</button>
  </div>
</template>

<style scoped>
.query-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: var(--danger);
  text-align: center;
}
</style>
