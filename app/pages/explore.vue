<script setup lang="ts">
import type { Palette } from '~/types'

const route = useRoute()
const api = usePalettes()

useHead({ title: 'Explore · COLOR' })

const sort = computed<FeedSort>(() => (route.query.sort === 'popular' ? 'popular' : 'new'))

// useAsyncData fetches on the server for the first render, sends the result
// to the browser, and refetches whenever `sort` changes.
const { data: firstPage, error, refresh } = await useAsyncData(
  'explore',
  () => api.feed(sort.value),
  { watch: [sort] },
)

// Extra pages from "Load more" live in the browser only.
const more = ref<Palette[]>([])
const page = ref(0)
const lastBatchSize = ref<number | null>(null)
const loadingMore = ref(false)
const moreError = ref(false)

watch(sort, () => {
  more.value = []
  page.value = 0
  lastBatchSize.value = null
})

// Dedupe by id: new palettes published between pages shift everything down by one.
const palettes = computed(() => {
  const byId = new Map<string, Palette>()
  for (const p of [...(firstPage.value ?? []), ...more.value]) byId.set(p.id, p)
  return [...byId.values()]
})

const hasMore = computed(() => (lastBatchSize.value ?? firstPage.value?.length ?? 0) === PAGE_SIZE)

async function loadMore() {
  loadingMore.value = true
  moreError.value = false
  try {
    const next = await api.feed(sort.value, page.value + 1)
    more.value.push(...next)
    page.value++
    lastBatchSize.value = next.length
  }
  catch {
    moreError.value = true
  }
  finally {
    loadingMore.value = false
  }
}
</script>

<template>
  <div class="container">
    <header class="explore__head">
      <h1 class="page-title gradient-text">Explore</h1>
      <nav class="tabs" aria-label="Sort">
        <NuxtLink :to="{ query: {} }" class="tab" :class="{ active: sort === 'new' }">New</NuxtLink>
        <NuxtLink :to="{ query: { sort: 'popular' } }" class="tab" :class="{ active: sort === 'popular' }">Popular</NuxtLink>
      </nav>
    </header>

    <QueryError v-if="error" @retry="refresh()" />
    <p v-else-if="palettes.length === 0" class="empty">
      No palettes yet. <NuxtLink to="/generate">Be the first.</NuxtLink>
    </p>
    <template v-else>
      <div class="palette-grid">
        <PaletteCard v-for="p in palettes" :key="p.id" :palette="p" />
      </div>
      <div class="explore__more">
        <p v-if="moreError" class="form-error">Couldn't load more.</p>
        <button v-if="hasMore" class="btn btn--ghost" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? 'Loading…' : moreError ? 'Try again' : 'Load more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.explore__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.explore__more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem 0 5rem;
}
</style>

<style>
/* Unscoped: the profile page uses the same tabs. */
.tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-raised);
  border-radius: 999px;
  padding: 4px;
}

.tab {
  padding: 8px 20px;
  border-radius: 999px;
  text-decoration: none;
  color: var(--muted);
  font-weight: 700;
}

.tab.active {
  background: var(--grad-button);
  color: #fff;
}
</style>
