<script setup lang="ts">
// Every file in app/pages/ becomes a route: this one is /generate.

const route = useRoute()
const router = useRouter()
const user = useSupabaseUser()
const api = usePalettes()
const { toLogin } = useAuthRedirect()

useHead({ title: 'Mix a palette · COLOR' })

// useState (not ref) so the server's random colours are sent to the browser
// instead of the browser rolling different ones. It also keeps your palette,
// undo steps and pins if you visit another page and come back.
const history = useState('generator-history', () =>
  createHistory(Array.from({ length: PALETTE_SIZE }, () => randomColor())),
)
const locked = useState<boolean[]>('generator-locks', () => Array(PALETTE_SIZE).fill(false))
const mode = useState<HarmonyMode>('generator-mode', () => 'random')

// computed() derives a value that updates itself when its inputs change.
const colors = computed(() => history.value.present)
const canUndo = computed(() => history.value.past.length > 0)
const canRedo = computed(() => history.value.future.length > 0)

// A palette in the URL (?c=ff0844-…) wins — that's how shared links and
// the "log in, then come back" trip keep your colours.
const fromUrl = decodeColors(route.query.c)
if (fromUrl && encodeColors(fromUrl) !== encodeColors(colors.value)) {
  history.value = pushHistory(history.value, fromUrl)
}

function syncUrl() {
  const c = encodeColors(colors.value)
  if (route.query.c !== c) router.replace({ query: { ...route.query, c } })
}

function setColors(next: string[]) {
  history.value = pushHistory(history.value, next)
}

function mix() {
  setColors(harmonize(colors.value, locked.value, mode.value))
}

function pickMode(m: HarmonyMode) {
  mode.value = m
  mix()
}

function toggleLock(i: number) {
  locked.value = locked.value.map((l, j) => (j === i ? !l : l))
}

function setColor(i: number, hex: string) {
  setColors(colors.value.map((c, j) => (j === i ? hex : c)))
}

const stepBack = () => (history.value = undo(history.value))
const stepForward = () => (history.value = redo(history.value))

// Space mixes; Ctrl/⌘+Z undoes, with Shift (or Ctrl+Y) redoes.
// Text fields keep their own keys.
function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement).closest('input, textarea, select')) return
  const mod = e.ctrlKey || e.metaKey
  if (mod && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    if (e.shiftKey) stepForward()
    else stepBack()
    return
  }
  if (mod && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    stepForward()
    return
  }
  if (e.code !== 'Space' || e.repeat || mod) return
  if ((e.target as HTMLElement).closest('button, a')) return
  e.preventDefault()
  mix()
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
    publishError.value = e instanceof Error ? e.message : 'Publishing failed. Check your connection and try again.'
  }
  finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="counter">
    <div class="counter__swatches">
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

    <div class="counter__bar">
      <div class="counter__inner container">
        <div class="counter__mix">
          <div class="modes" role="group" aria-label="Harmony">
            <button
              v-for="m in HARMONY_MODES"
              :key="m.mode"
              class="modes__btn"
              :aria-pressed="mode === m.mode"
              @mousedown.prevent
              @click="pickMode(m.mode)"
            >
              {{ m.label }}
            </button>
          </div>

          <div class="counter__actions">
            <button class="btn" @mousedown.prevent @click="mix">
              Mix <kbd>space</kbd>
            </button>
            <button class="icon-btn" :disabled="!canUndo" aria-label="Undo" title="Undo (Ctrl+Z)" @mousedown.prevent @click="stepBack">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
            </button>
            <button class="icon-btn" :disabled="!canRedo" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" @mousedown.prevent @click="stepForward">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" /></svg>
            </button>
          </div>
        </div>

        <!-- @submit.prevent = handle the form ourselves instead of reloading the page -->
        <form class="counter__publish" @submit.prevent="publish">
          <template v-if="user">
            <input
              v-model="name"
              class="input"
              placeholder="Name your palette"
              maxlength="40"
              aria-label="Palette name"
              required
            >
            <button class="btn" :disabled="publishing || !name.trim()">
              {{ publishing ? 'Publishing…' : 'Publish' }}
            </button>
          </template>
          <button v-else class="btn btn--plain" type="submit">Log in to publish</button>
        </form>
      </div>
      <p v-if="publishError" class="form-error container">{{ publishError }}</p>
    </div>
  </div>
</template>

<style scoped>
.counter {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--nav-height) - 4px);
  min-height: 560px;
}

.counter__swatches {
  flex: 1;
  display: flex;
  min-height: 0;
}

.counter__bar {
  background: var(--card);
  border-top: 1.5px solid var(--ink);
  padding: 14px 0;
}

.counter__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  flex-wrap: wrap;
}

.counter__mix {
  display: flex;
  align-items: center;
  gap: 1rem 1.5rem;
  flex-wrap: wrap;
}

.counter__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

kbd {
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  font-stretch: 85%;
  padding: 1px 6px;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.2);
}

/* Harmony modes: a row of label tabs, the chosen one printed in shop blue. */
.modes {
  display: flex;
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  overflow: hidden;
}

.modes__btn {
  padding: 9px 14px;
  border: none;
  background: none;
  font-weight: 600;
  font-stretch: 88%;
  cursor: pointer;
}

.modes__btn + .modes__btn {
  border-left: 1.5px solid var(--ink);
}

.modes__btn:hover {
  background: rgb(35 64 168 / 0.08);
}

.modes__btn[aria-pressed="true"] {
  background: var(--brand);
  color: #fff;
}

.icon-btn {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: var(--radius);
  background: none;
  cursor: pointer;
}

.icon-btn:hover:not(:disabled) {
  background: rgb(0 0 0 / 0.06);
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.icon-btn svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.counter__publish {
  display: flex;
  gap: 0.6rem;
}

.counter__publish .input {
  width: 240px;
}

@media (max-width: 700px) {
  .counter {
    height: auto;
  }

  .counter__swatches {
    flex-direction: column;
  }

  .counter__swatches > * {
    min-height: 78px;
  }

  .counter__mix,
  .counter__publish {
    width: 100%;
  }

  /* five modes don't fit one row on a phone: wrap them as separate tabs */
  .modes {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    border: none;
  }

  .modes__btn,
  .modes__btn + .modes__btn {
    border: 1.5px solid var(--ink);
    border-radius: var(--radius);
    padding: 9px 4px;
  }

  .counter__actions .btn {
    flex: 1;
  }

  /* no space bar on a phone */
  kbd {
    display: none;
  }

  .counter__publish {
    flex-direction: column;
  }

  .counter__publish .input {
    width: 100%;
  }
}
</style>
