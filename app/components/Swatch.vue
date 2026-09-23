<script setup lang="ts">
// One tall colour column: the colour, its hex code, a copy button and
// (in the generator) a lock and an editable hex.

// defineProps / defineEmits declare what the parent passes in and what
// events this component sends back up.
const props = defineProps<{
  color: string
  locked?: boolean
  lockable?: boolean
  editable?: boolean
}>()

const emit = defineEmits<{
  'toggle-lock': []
  'update:color': [color: string]
}>()

const fg = computed(() => textColorFor(props.color))
const draft = ref(props.color)
const copied = ref(false)

// Keep the text box in sync when the colour changes from outside (reroll).
watch(() => props.color, c => (draft.value = c))

function commit() {
  const hex = normalizeHex(draft.value)
  if (hex) emit('update:color', hex)
  else draft.value = props.color // invalid → put the old value back
}

async function copy() {
  try {
    await navigator.clipboard.writeText(props.color)
    copied.value = true
    setTimeout(() => (copied.value = false), 1200)
  }
  catch {
    // clipboard blocked (e.g. insecure context) — nothing useful to do
  }
}
</script>

<template>
  <div class="swatch" :style="{ background: color, color: fg }">
    <input
      v-if="editable"
      v-model="draft"
      class="swatch__hex swatch__hex--input"
      :style="{ color: fg }"
      maxlength="7"
      spellcheck="false"
      aria-label="Hex colour"
      @change="commit"
      @keydown.enter="($event.target as HTMLInputElement).blur()"
    >
    <span v-else class="swatch__hex">{{ color }}</span>

    <div class="swatch__actions">
      <!-- mousedown.prevent stops the button taking focus, so the space bar keeps rerolling -->
      <button class="swatch__icon" :title="copied ? 'Copied!' : 'Copy hex'" @mousedown.prevent @click="copy">
        <svg v-if="!copied" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
      </button>
      <button
        v-if="lockable"
        class="swatch__icon"
        :class="{ 'is-locked': locked }"
        :title="locked ? 'Unlock' : 'Lock'"
        :aria-pressed="locked"
        @mousedown.prevent
        @click="emit('toggle-lock')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path :d="locked ? 'M8 11V7a4 4 0 0 1 8 0v4' : 'M8 11V7a4 4 0 0 1 7.5-2'" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.swatch {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0.5rem;
  transition: background 0.25s ease;
  min-width: 0;
}

.swatch__hex {
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.swatch__hex--input {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  text-align: center;
  width: 100%;
  max-width: 7.5em;
}

.swatch__hex--input:hover,
.swatch__hex--input:focus {
  border-bottom-color: currentColor;
  outline: none;
}

.swatch__actions {
  display: flex;
  gap: 0.5rem;
}

.swatch__icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.2s, background 0.2s;
}

.swatch__icon:hover,
.swatch__icon.is-locked {
  opacity: 1;
  background: color-mix(in srgb, currentColor 15%, transparent);
}

.swatch__icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 700px) {
  .swatch {
    flex-direction: row;
    justify-content: space-between;
    padding: 0 1rem;
  }

  .swatch__hex--input {
    text-align: left;
  }
}
</style>
