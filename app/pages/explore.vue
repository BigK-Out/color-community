<script setup lang="ts">
import type { Palette } from '~/types'

const route = useRoute()
const api = usePalettes()

useHead({ title: 'The rack · COLOR' })

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
    <header class="rack-head">
      <div>
        <h1 class="page-title">The rack</h1>
        <p class="lede">Every palette people have published. Heart the ones you'd paint a wall with.</p>
      </div>
      <nav class="shelf-tags" aria-label="Order">
        <NuxtLink :to="{ query: {} }" class="shelf-tag" :class="{ active: sort === 'new' }">Newest</NuxtLink>
        <NuxtLink :to="{ query: { sort: 'popular' } }" class="shelf-tag" :class="{ active: sort === 'popular' }">Most hearted</NuxtLink>
      </nav>
    </header>

    <QueryError v-if="error" message="The rack didn't load." @retry="refresh()" />
    <p v-else-if="palettes.length === 0" class="empty">
      Nothing on the rack yet. <NuxtLink to="/generate">Mix the first palette.</NuxtLink>
    </p>
    <template v-else>
      <div class="rack">
        <PaintChip v-for="p in palettes" :key="p.id" :palette="p" />
      </div>
      <div class="rack-more">
        <p v-if="moreError" class="form-error">More palettes didn't load.</p>
        <button v-if="hasMore" class="btn btn--plain" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? 'Loading…' : moreError ? 'Try again' : 'Load more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rack-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.rack-head .page-title {
  margin-bottom: 0.75rem;
}

.rack-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4rem 0 6rem;
}
</style>

<style>
/* Unscoped: the profile page uses the same tags.
   Shelf-edge price labels — the one you're on is printed in shop blue. */
.shelf-tags {
  display: flex;
  gap: 0.5rem;
}

.shelf-tag {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 16px;
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--hang-shadow);
  font-weight: 700;
  font-stretch: 90%;
  text-decoration: none;
}

.shelf-tag:hover {
  box-shadow: var(--hang-shadow), inset 0 -3px 0 var(--brand);
}

.shelf-tag.active {
  background: var(--brand);
  color: #fff;
}
</style>
