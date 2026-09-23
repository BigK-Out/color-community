<script setup lang="ts">
// [id] in the file name is a route parameter: /p/abc → route.params.id === 'abc'.

const route = useRoute()
const user = useSupabaseUser()
const api = usePalettes()

const id = route.params.id as string

const { data: palette, error, refresh } = await useAsyncData(`palette-${id}`, () => api.byId(id))

// Loaded fine but nothing there → Nuxt's error page (app/error.vue).
if (!error.value && !palette.value) {
  throw createError({ statusCode: 404, statusMessage: 'Palette not found', fatal: true })
}

useHead({ title: () => (palette.value ? `${palette.value.name} · COLOR` : 'COLOR') })

const isAuthor = computed(() => !!user.value && user.value.sub === palette.value?.author_id)
const created = computed(() =>
  palette.value ? new Date(palette.value.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '',
)

const deleting = ref(false)
const deleteError = ref('')

async function remove() {
  if (!palette.value || !confirm(`Delete "${palette.value.name}"? This can't be undone.`)) return
  deleting.value = true
  deleteError.value = ''
  try {
    await api.remove(palette.value.id)
    await navigateTo(palette.value.author ? `/u/${palette.value.author.username}` : '/explore')
  }
  catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'Could not delete.'
    deleting.value = false
  }
}
</script>

<template>
  <div class="container">
    <QueryError v-if="error" @retry="refresh()" />

    <article v-else-if="palette" class="palette">
      <div class="palette__swatches">
        <Swatch v-for="(c, i) in palette.colors" :key="i" :color="c" />
      </div>

      <header class="palette__head">
        <div>
          <h1 class="palette__name">{{ palette.name }}</h1>
          <p class="muted">
            by
            <NuxtLink v-if="palette.author" :to="`/u/${palette.author.username}`">@{{ palette.author.username }}</NuxtLink>
            <span v-else>someone</span>
            · {{ created }}
          </p>
        </div>
        <div class="palette__actions">
          <LikeButton :palette-id="palette.id" :count="palette.like_count" class="palette__like" />
          <button v-if="isAuthor" class="btn btn--danger" :disabled="deleting" @click="remove">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </header>
      <p v-if="deleteError" class="form-error">{{ deleteError }}</p>
    </article>
  </div>
</template>

<style scoped>
.palette {
  padding: 2.5rem 0 5rem;
}

.palette__swatches {
  display: flex;
  height: 60vh;
  min-height: 320px;
  border-radius: var(--radius);
  overflow: hidden;
}

.palette__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
}

.palette__name {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}

.palette__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.palette__like {
  font-size: 1.2rem;
}

@media (max-width: 700px) {
  .palette__swatches {
    flex-direction: column;
  }
}
</style>
