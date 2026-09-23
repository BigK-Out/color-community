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
  throw createError({ statusCode: 404, statusMessage: 'Nobody goes by that name', fatal: true })
}

useHead({ title: `@${username} · COLOR` })

const tab = computed(() => (route.query.tab === 'liked' ? 'liked' : 'palettes'))
const isMe = computed(() => !!user.value && user.value.sub === profile.value?.id)
const since = computed(() =>
  profile.value ? new Date(profile.value.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '',
)

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
    <QueryError v-if="profileError" message="This profile didn't load." @retry="refreshProfile()" />

    <template v-else-if="profile">
      <header class="profile-head">
        <div>
          <h1 class="page-title">@{{ profile.username }}</h1>
          <p class="lede">Mixing since {{ since }}.</p>
        </div>
        <nav class="shelf-tags" aria-label="Show">
          <NuxtLink :to="{ query: {} }" class="shelf-tag" :class="{ active: tab === 'palettes' }">Mixed</NuxtLink>
          <NuxtLink :to="{ query: { tab: 'liked' } }" class="shelf-tag" :class="{ active: tab === 'liked' }">Hearted</NuxtLink>
        </nav>
      </header>

      <QueryError v-if="error" message="These palettes didn't load." @retry="refresh()" />
      <div v-else-if="palettes?.length" class="rack profile-rack">
        <PaintChip v-for="p in palettes" :key="p.id" :palette="p" />
      </div>
      <p v-else class="empty">
        <template v-if="tab === 'liked'">
          <template v-if="isMe">You haven’t hearted anything yet. <NuxtLink to="/explore">Browse the rack.</NuxtLink></template>
          <template v-else>@{{ profile.username }} hasn’t hearted anything yet.</template>
        </template>
        <template v-else>
          <template v-if="isMe">You haven’t published a palette yet. <NuxtLink to="/generate">Mix one.</NuxtLink></template>
          <template v-else>@{{ profile.username }} hasn’t published a palette yet.</template>
        </template>
      </p>
    </template>
  </div>
</template>

<style scoped>
.profile-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.profile-head .page-title {
  margin-bottom: 0.5rem;
  overflow-wrap: anywhere;
}

.profile-rack {
  padding-bottom: 6rem;
}
</style>
