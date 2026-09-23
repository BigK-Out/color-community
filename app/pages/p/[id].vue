<script setup lang="ts">
// [id] in the file name is a route parameter: /p/abc → route.params.id === 'abc'.

const route = useRoute()
const user = useSupabaseUser()
const api = usePalettes()

const id = route.params.id as string

const { data: palette, error, refresh } = await useAsyncData(`palette-${id}`, () => api.byId(id))

// Loaded fine but nothing there → Nuxt's error page (app/error.vue).
if (!error.value && !palette.value) {
  throw createError({ statusCode: 404, statusMessage: 'That palette isn’t on the rack', fatal: true })
}

useHead({ title: () => (palette.value ? `${palette.value.name} · COLOR` : 'COLOR') })

const isAuthor = computed(() => !!user.value && user.value.sub === palette.value?.author_id)
const number = computed(() => (palette.value ? chipNumber(palette.value.id) : ''))
const created = computed(() =>
  palette.value ? new Date(palette.value.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : '',
)

const deleting = ref(false)
const deleteError = ref('')

async function remove() {
  if (!palette.value || !confirm(`Take “${palette.value.name}” off the rack? This can’t be undone.`)) return
  deleting.value = true
  deleteError.value = ''
  try {
    await api.remove(palette.value.id)
    await navigateTo(palette.value.author ? `/u/${palette.value.author.username}` : '/explore')
  }
  catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'Deleting failed. Try again.'
    deleting.value = false
  }
}
</script>

<template>
  <div class="container">
    <QueryError v-if="error" message="This palette didn't load." @retry="refresh()" />

    <article v-else-if="palette" class="sheet card-stock">
      <div class="sheet__swatches">
        <Swatch v-for="(c, i) in palette.colors" :key="i" :color="c" />
      </div>

      <footer class="sheet__info">
        <div>
          <p class="sheet__no">No. {{ number }}</p>
          <h1 class="sheet__name">{{ palette.name }}</h1>
          <p class="sheet__by">
            Mixed by
            <NuxtLink v-if="palette.author" :to="`/u/${palette.author.username}`">@{{ palette.author.username }}</NuxtLink>
            <span v-else>someone who left</span>
            on {{ created }}
          </p>
        </div>
        <div class="sheet__actions">
          <LikeButton :palette-id="palette.id" :count="palette.like_count" class="sheet__like" />
          <NuxtLink :to="`/generate?c=${encodeColors(palette.colors)}`" class="btn btn--plain">Open at the counter</NuxtLink>
          <button v-if="isAuthor" class="btn btn--danger" :disabled="deleting" @click="remove">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </footer>
      <p v-if="deleteError" class="form-error sheet__error">{{ deleteError }}</p>
    </article>
  </div>
</template>

<style scoped>
.sheet {
  margin: 3rem 0 6rem;
  overflow: hidden;
}

.sheet__swatches {
  display: flex;
  height: 58vh;
  min-height: 340px;
}

.sheet__info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.75rem clamp(1.25rem, 3vw, 2rem) 2rem;
  border-top: 1.5px solid var(--ink);
}

.sheet__no {
  font-stretch: 85%;
  color: var(--ink-soft);
}

.sheet__name {
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 900;
  font-stretch: 108%;
  line-height: 1.02;
  letter-spacing: -0.015em;
  margin: 0.15rem 0 0.5rem;
}

.sheet__by {
  color: var(--ink-soft);
}

.sheet__by a {
  color: var(--ink);
  font-weight: 700;
}

.sheet__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.sheet__like {
  font-size: 1.15rem;
  margin-right: 0.5rem;
}

.sheet__error {
  padding: 0 2rem 1.5rem;
}

@media (max-width: 700px) {
  .sheet__swatches {
    flex-direction: column;
    height: auto;
  }

  .sheet__swatches > * {
    min-height: 84px;
  }
}
</style>
