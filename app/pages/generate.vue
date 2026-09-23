<script setup lang="ts">
// Every file in app/pages/ becomes a route: this one is /generate.

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()
const api = usePalettes()
const { toLogin } = useAuthRedirect()

useHead({ title: 'Generate · COLOR' })

// useState (not ref) so the server's random colours are sent to the browser
// instead of the browser rolling different ones. It also keeps the palette
// if you visit another page and come back.
const colors = useState<string[]>('generator-colors', () =>
  Array.from({ length: PALETTE_SIZE }, () => randomColor()),
)
const locked = useState<boolean[]>('generator-locks', () => Array(PALETTE_SIZE).fill(false))

// A palette in the URL (?c=ff0844-…) wins — that's how shared links and
// the "log in, then come back" trip keep your colours.
const fromUrl = decodeColors(route.query.c)
if (fromUrl) colors.value = fromUrl

function syncUrl() {
  const c = encodeColors(colors.value)
  if (route.query.c !== c) router.replace({ query: { ...route.query, c } })
}

function reroll() {
  colors.value = generate(colors.value, locked.value)
}

function toggleLock(i: number) {
  locked.value = locked.value.map((l, j) => (j === i ? !l : l))
}

function setColor(i: number, hex: string) {
  colors.value = colors.value.map((c, j) => (j === i ? hex : c))
}

// Space bar rerolls — unless you're typing or on a button/link.
function onKey(e: KeyboardEvent) {
  if (e.code !== 'Space' || e.repeat) return
  if ((e.target as HTMLElement).closest('input, textarea, select, button, a')) return
  e.preventDefault()
  reroll()
}

// onMounted runs in the browser only, after the page is on screen.
onMounted(() => {
  window.addEventListener('keydown', onKey)
  syncUrl()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
watch(colors, syncUrl)

// ─── Publishing ───
const name = ref('')
const publishing = ref(false)
const publishError = ref('')

async function publish() {
  if (!user.value) return toLogin()
  if (!name.value.trim()) return
  publishing.value = true
  publishError.value = ''
  try {
    const id = await api.publish(name.value, colors.value)
    await navigateTo(`/p/${id}`)
  }
  catch (e) {
    publishError.value = e instanceof Error ? e.message : 'Could not publish. Try again.'
  }
  finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="generator">
    <div class="generator__swatches">
      <Swatch
        v-for="(c, i) in colors"
        :key="i"
        :color="c"
        :locked="locked[i]"
        lockable
        editable
        @toggle-lock="toggleLock(i)"
        @update:color="setColor(i, $event)"
      />
    </div>

    <div class="generator__bar container">
      <p class="generator__hint muted">
        Press <kbd>space</kbd> to generate · lock the colours you like
      </p>
      <button class="btn btn--ghost generator__reroll" @mousedown.prevent @click="reroll">Generate</button>

      <!-- @submit.prevent = handle the form ourselves instead of reloading the page -->
      <form class="generator__publish" @submit.prevent="publish">
        <template v-if="user">
          <input
            v-model="name"
            class="input"
            placeholder="Name this palette"
            maxlength="40"
            aria-label="Palette name"
            required
          >
          <button class="btn" :disabled="publishing || !name.trim()">
            {{ publishing ? 'Publishing…' : 'Publish' }}
          </button>
        </template>
        <button v-else class="btn" type="submit">Log in to publish</button>
      </form>
    </div>
    <p v-if="publishError" class="form-error container">{{ publishError }}</p>
  </div>
</template>

<style scoped>
.generator {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--nav-height));
  padding-bottom: 1rem;
}

.generator__swatches {
  flex: 1;
  display: flex;
  min-height: 420px;
}

.generator__bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
}

.generator__hint {
  flex: 1;
  min-width: 200px;
}

kbd {
  border: 1px solid #555;
  border-bottom-width: 3px;
  border-radius: 4px;
  padding: 0 6px;
  font-family: inherit;
  color: #fff;
}

.generator__reroll {
  display: none;
}

.generator__publish {
  display: flex;
  gap: 0.75rem;
}

.generator__publish .input {
  width: 240px;
}

@media (max-width: 700px) {
  .generator__swatches {
    flex-direction: column;
    min-height: 60vh;
  }

  .generator__hint {
    display: none;
  }

  .generator__reroll {
    display: inline-flex;
  }

  .generator__bar > * {
    width: 100%;
  }

  .generator__publish {
    flex-direction: column;
  }

  .generator__publish .input {
    width: 100%;
  }
}
</style>
