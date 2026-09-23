<script setup lang="ts">
const user = useSupabaseUser()
const { load: loadMyLikes } = useMyLikes()

// Whenever someone logs in or out, refresh which palettes they have liked.
// Browser only: the server render just shows empty hearts, then they fill in.
if (import.meta.client) {
  watch(() => user.value?.sub, () => loadMyLikes(), { immediate: true })
}
</script>

<template>
  <NuxtRouteAnnouncer />
  <NavBar />
  <main>
    <!-- <NuxtPage /> renders whichever file in app/pages/ matches the URL -->
    <NuxtPage />
  </main>
  <SiteFooter />
</template>
