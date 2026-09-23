<script setup lang="ts">
// Heart + count. Updates instantly, then tells Supabase; if that fails,
// it puts everything back the way it was.

const props = defineProps<{ paletteId: string, count: number }>()

const user = useSupabaseUser()
const api = usePalettes()
const myLikes = useMyLikes()
const { toLogin } = useAuthRedirect()

const count = ref(props.count)
const busy = ref(false)
const failed = ref(false)
const liked = computed(() => myLikes.has(props.paletteId))

watch(() => props.count, c => (count.value = c))

async function toggle() {
  if (!user.value) return toLogin()
  if (busy.value) return

  const wasLiked = liked.value
  busy.value = true
  failed.value = false
  myLikes.set(props.paletteId, !wasLiked)
  count.value += wasLiked ? -1 : 1

  try {
    await (wasLiked ? api.unlike(props.paletteId) : api.like(props.paletteId))
  }
  catch {
    myLikes.set(props.paletteId, wasLiked)
    count.value += wasLiked ? 1 : -1
    failed.value = true
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <button
    class="like"
    :class="{ 'is-liked': liked, 'is-failed': failed }"
    :aria-pressed="liked"
    :title="failed ? 'Couldn\'t save that — try again' : liked ? 'Unlike' : 'Like'"
    @click.prevent.stop="toggle"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z" />
    </svg>
    <span>{{ count }}</span>
  </button>
</template>

<style scoped>
.like {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--radius);
  font-weight: 700;
}

.like:hover {
  color: #fff;
}

.like svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  transition: transform 0.15s ease;
}

.like:active svg {
  transform: scale(1.25);
}

.like.is-liked {
  color: #ff1ead;
}

.like.is-liked svg {
  fill: currentColor;
}

.like.is-failed {
  color: var(--danger);
}
</style>
