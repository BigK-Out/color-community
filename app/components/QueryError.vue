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
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  margin: 1rem 0 4rem;
  padding: 16px 22px;
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--hang-shadow), inset 4px 0 0 var(--danger);
  color: var(--danger);
  font-weight: 600;
}
</style>
