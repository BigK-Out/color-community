<script setup lang="ts">
defineProps<{ colors: string[] }>()
</script>

<template>
  <div class="strip">
    <!-- v-for repeats the element once per item; :key helps Vue track them -->
    <span v-for="(c, i) in colors" :key="i" class="strip__color" :style="{ background: c }" :title="c" />
  </div>
</template>

<style scoped>
.strip {
  display: flex;
  height: 140px;
  border-radius: var(--radius);
  overflow: hidden;
}

.strip__color {
  flex: 1;
  transition: flex 0.25s ease;
}

.strip:hover .strip__color:hover {
  flex: 1.8;
}
</style>
