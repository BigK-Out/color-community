<script setup lang="ts">
// One tall colour with a white label underneath, like a single paint chip
// blown up: name, hex, copy — and in the generator, a pin to keep it.

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

const name = computed(() => colorName(props.color))
const draft = ref(props.color.slice(1).toUpperCase())
const copied = ref(false)

// Keep the text box in sync when the colour changes from outside (reroll, undo).
watch(() => props.color, c => (draft.value = c.slice(1).toUpperCase()))

function commit() {
  const hex = normalizeHex(draft.value)
  if (hex) emit('update:color', hex)
  draft.value = (hex ?? props.color).slice(1).toUpperCase() // invalid → put the old value back
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
  <div class="swatch" :class="{ 'is-locked': locked }">
    <div class="swatch__paint" :style="{ background: color }" />
    <div class="swatch__label">
      <p class="swatch__name" :title="name">{{ name }}</p>
      <div class="swatch__row">
        <label v-if="editable" class="swatch__hex">
          <span aria-hidden="true">#</span>
          <input
            v-model="draft"
            maxlength="7"
            spellcheck="false"
            autocomplete="off"
            :aria-label="`Hex code for ${name}`"
            @change="commit"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          >
        </label>
        <span v-else class="swatch__hex">#{{ color.slice(1).toUpperCase() }}</span>

        <!-- mousedown.prevent stops the button taking focus, so the space bar keeps mixing -->
        <button class="swatch__icon" :aria-label="copied ? 'Copied' : `Copy ${color}`" @mousedown.prevent @click="copy">
          <svg v-if="!copied" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
        </button>
        <button
          v-if="lockable"
          class="swatch__icon swatch__pin"
          :aria-label="locked ? `Unpin ${name}` : `Pin ${name}`"
          :aria-pressed="locked"
          @mousedown.prevent
          @click="emit('toggle-lock')"
        >
          <!-- a push pin -->
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z" />
            <path d="M12 14v7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swatch {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.swatch__paint {
  flex: 1;
  transition: background-color 0.3s ease;
}

.swatch__label {
  background: var(--card);
  padding: 12px 12px 10px;
  border-top: 1px solid var(--rule);
  border-left: 1px solid var(--rule);
}

.swatch:first-child .swatch__label {
  border-left: none;
}

.swatch__name {
  font-size: 1.15rem;
  font-weight: 800;
  font-stretch: 82%;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.swatch__row {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
}

.swatch__hex {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  color: var(--ink-soft);
  font-stretch: 90%;
}

.swatch__hex input {
  width: 100%;
  min-width: 0;
  border: none;
  background: none;
  font-stretch: 90%;
  color: var(--ink-soft);
  padding: 2px 0;
  border-bottom: 1.5px dashed transparent;
}

.swatch__hex input:hover {
  border-bottom-color: var(--rule);
}

.swatch__hex input:focus {
  outline: none;
  border-bottom-color: var(--brand);
  color: var(--ink);
}

.swatch__icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius);
  background: none;
  color: var(--ink-soft);
  cursor: pointer;
}

.swatch__icon:hover {
  color: var(--ink);
  background: rgb(0 0 0 / 0.06);
}

.swatch__icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* A pinned colour: the pin goes in, the label gets the shop's colour. */
.is-locked .swatch__pin {
  color: #fff;
  background: var(--brand);
}

.is-locked .swatch__pin svg path:first-child {
  fill: currentColor;
}

.is-locked .swatch__label {
  box-shadow: inset 0 4px 0 var(--brand);
}

@media (max-width: 700px) {
  .swatch {
    flex-direction: row;
  }

  .swatch__paint {
    flex: 0 0 38%;
  }

  .swatch__label {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-left: 1px solid var(--rule);
    border-top: none;
  }

  .swatch + .swatch .swatch__label {
    border-top: 1px solid var(--rule);
  }

  .is-locked .swatch__label {
    box-shadow: inset 4px 0 0 var(--brand);
  }
}
</style>
