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
  <main class="container missing">
    <!-- An empty paint chip: the colour you asked for isn't in stock. -->
    <div class="missing__chip card-stock" aria-hidden="true">
      <span class="missing__blank" />
      <span class="missing__blank" />
      <span class="missing__blank" />
      <p>No. {{ error.statusCode }}</p>
    </div>
    <div>
      <h1 class="page-title">{{ notFound ? (error.statusMessage || 'Nothing here') : 'Something broke' }}</h1>
      <p class="lede">
        {{ notFound
          ? 'It may have been taken down, or the link has a typo.'
          : 'The page hit an error. Reload to try again.' }}
      </p>
      <button class="btn btn--big missing__btn" @click="clearError({ redirect: '/explore' })">Go to the rack</button>
    </div>
  </main>
</template>

<style scoped>
.missing {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
  gap: 3rem;
  padding-top: 6rem;
  padding-bottom: 6rem;
}

.missing__chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 12px 10px;
  transform: rotate(-4deg);
}

.missing__blank {
  height: 64px;
  border: 1.5px dashed var(--rule);
}

.missing__chip p {
  margin-top: 8px;
  font-stretch: 85%;
  color: var(--ink-soft);
}

.missing__btn {
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .missing {
    grid-template-columns: 1fr;
    padding-top: 3rem;
  }

  .missing__chip {
    width: 160px;
  }
}
</style>
