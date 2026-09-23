<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const api = usePalettes()

const username = (route.params.username as string).toLowerCase()

const { data: profile, error: profileError, refresh: refreshProfile } = await useAsyncData(
  `profile-${username}`,
  () => api.profileByUsername(username),
)

if (!profileError.value && !profile.value) {
  throw createError({ statusCode: 404, statusMessage: 'User not found', fatal: true })
}

useHead({ title: `@${username} · COLOR` })

const tab = computed(() => (route.query.tab === 'liked' ? 'liked' : 'palettes'))
const isMe = computed(() => !!user.value && user.value.sub === profile.value?.id)

const { data: palettes, error, refresh } = await useAsyncData(
  `profile-${username}-list`,
  () => {
    if (!profile.value) return Promise.resolve([])
    return tab.value === 'liked' ? api.likedBy(profile.value.id) : api.byAuthor(profile.value.id)
  },
  { watch: [tab] },
)
</script>

<template>
  <div class="container">
    <QueryError v-if="profileError" @retry="refreshProfile()" />

    <template v-else-if="profile">
      <header class="profile__head">
        <h1 class="page-title gradient-text gradient-text--warm">@{{ profile.username }}</h1>
        <nav class="tabs" aria-label="Show">
          <NuxtLink :to="{ query: {} }" class="tab" :class="{ active: tab === 'palettes' }">Palettes</NuxtLink>
          <NuxtLink :to="{ query: { tab: 'liked' } }" class="tab" :class="{ active: tab === 'liked' }">Liked</NuxtLink>
        </nav>
      </header>

      <QueryError v-if="error" @retry="refresh()" />
      <div v-else-if="palettes?.length" class="palette-grid profile__grid">
        <PaletteCard v-for="p in palettes" :key="p.id" :palette="p" />
      </div>
      <p v-else class="empty">
        <template v-if="tab === 'liked'">
          {{ isMe ? "You haven't" : `@${profile.username} hasn't` }} liked anything yet.
          <NuxtLink v-if="isMe" to="/explore">Go explore.</NuxtLink>
        </template>
        <template v-else>
          {{ isMe ? "You haven't" : `@${profile.username} hasn't` }} published a palette yet.
          <NuxtLink v-if="isMe" to="/generate">Make one.</NuxtLink>
        </template>
      </p>
    </template>
  </div>
</template>

<style scoped>
.profile__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile__grid {
  padding-bottom: 5rem;
}
</style>
