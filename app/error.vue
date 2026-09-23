<script setup lang="ts">
// Nuxt shows this instead of the whole app when a page throws createError(),
// so it brings its own NavBar.
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed(() => props.error.statusCode === 404)
useHead({ title: notFound.value ? 'Not found · COLOR' : 'Error · COLOR' })
</script>

<template>
  <NavBar />
  <main class="container error">
    <p class="error__code gradient-text">{{ error.statusCode }}</p>
    <h1>{{ notFound ? (error.statusMessage || 'Page not found') : 'Something broke' }}</h1>
    <button class="btn btn--big" @click="clearError({ redirect: '/' })">Back home</button>
  </main>
</template>

<style scoped>
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding-top: 8rem;
  text-align: center;
}

.error__code {
  font-size: clamp(6rem, 20vw, 12rem);
  font-weight: 700;
  line-height: 1;
}
</style>
