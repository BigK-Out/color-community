<script setup lang="ts">
// The colour-matching counter: bring a sample (pick one or paste a hex),
// get its name and the nearest colours we have names for.

// Starts on the colour of the board behind it.
const sample = ref('#c7a177')
const draft = ref(sample.value.slice(1).toUpperCase())

const matches = computed(() => nearestColors(sample.value, 4))
const best = computed(() => matches.value[0]!)
const others = computed(() => matches.value.slice(1))

const closeness = computed(() => {
  const d = best.value.distance
  if (d < 0.004) return 'Exact match'
  if (d < 0.02) return 'Near-identical'
  if (d < 0.05) return 'Close match'
  return 'Nearest we have'
})

function setSample(hex: string) {
  sample.value = hex
  draft.value = hex.slice(1).toUpperCase()
}

function onPick(e: Event) {
  setSample((e.target as HTMLInputElement).value)
}

function onType() {
  const hex = normalizeHex(draft.value)
  if (hex) sample.value = hex
}

function commitDraft() {
  draft.value = sample.value.slice(1).toUpperCase()
}
</script>

<template>
  <section class="matcher card-stock" aria-labelledby="matcher-title">
    <header class="matcher__head">
      <h2 id="matcher-title" class="matcher__title">Colour matching</h2>
      <p class="matcher__lede">Bring us a sample. Pick any colour or paste a hex code, and we’ll tell you what it’s called.</p>
    </header>

    <div class="matcher__body">
      <!-- Sample on the left, our match on the right, like holding a chip against a wall -->
      <div class="matcher__compare">
        <label class="matcher__well" :style="{ background: sample }">
          <input type="color" :value="sample" class="matcher__picker" aria-label="Pick a sample colour" @input="onPick">
          <span class="matcher__well-label" :style="{ color: textColorFor(sample) }">Your sample</span>
        </label>
        <div class="matcher__well matcher__well--match" :style="{ background: best.hex }">
          <span class="matcher__well-label" :style="{ color: textColorFor(best.hex) }">{{ best.name }}</span>
        </div>
      </div>

      <div class="matcher__result">
        <div class="matcher__controls">
          <label class="matcher__hex">
            <span aria-hidden="true">#</span>
            <input
              v-model="draft"
              maxlength="7"
              spellcheck="false"
              autocomplete="off"
              aria-label="Sample hex code"
              @input="onType"
              @blur="commitDraft"
            >
          </label>
          <button class="btn btn--plain" @click="setSample(randomColor())">Random sample</button>
        </div>

        <p class="matcher__closeness">{{ closeness }}</p>
        <p class="matcher__name" aria-live="polite">{{ best.name }}</p>
        <p class="matcher__code">#{{ best.hex.slice(1).toUpperCase() }}</p>

        <p class="matcher__also">Also close</p>
        <ul class="matcher__others">
          <li v-for="m in others" :key="m.hex + m.name">
            <button class="matcher__other" @click="setSample(m.hex)">
              <span class="matcher__dot" :style="{ background: m.hex }" />
              <span class="matcher__other-name">{{ m.name }}</span>
              <span class="matcher__other-hex">{{ m.hex.slice(1).toUpperCase() }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.matcher {
  padding: 2.5rem clamp(1.5rem, 4vw, 3rem) 3rem;
}

.matcher__title {
  font-size: 1.6rem;
  font-weight: 800;
}

.matcher__lede {
  margin-top: 0.35rem;
  color: var(--ink-soft);
  max-width: 52ch;
}

.matcher__body {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 2.5rem 3.5rem;
  margin-top: 2rem;
}

.matcher__compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 320px;
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  overflow: hidden;
}

.matcher__well {
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 14px;
  transition: background-color 0.25s ease;
}

label.matcher__well {
  cursor: pointer;
}

.matcher__well--match {
  border-left: 1.5px solid var(--ink);
}

/* The native colour picker covers the sample well, invisible, so clicking anywhere opens it. */
.matcher__picker {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.matcher__well:focus-within {
  outline: 3px solid var(--brand);
  outline-offset: -3px;
}

.matcher__well-label {
  position: relative;
  font-weight: 700;
  font-stretch: 85%;
  pointer-events: none;
}

.matcher__controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.matcher__hex {
  display: flex;
  align-items: center;
  gap: 2px;
  min-height: 46px;
  padding: 0 12px;
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  font-weight: 700;
  color: var(--ink-soft);
}

.matcher__hex:focus-within {
  outline: 3px solid var(--brand);
}

.matcher__hex input {
  width: 6.5ch;
  border: none;
  outline: none;
  background: none;
  font-weight: 700;
  color: var(--ink);
}

.matcher__closeness {
  margin-top: 1.75rem;
  font-weight: 700;
  color: var(--brand);
}

.matcher__name {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  font-stretch: 108%;
  line-height: 1.02;
  letter-spacing: -0.015em;
  overflow-wrap: anywhere;
}

.matcher__code {
  margin-top: 0.35rem;
  color: var(--ink-soft);
  font-stretch: 90%;
}

.matcher__also {
  margin-top: 1.75rem;
  font-weight: 700;
  font-size: 0.95rem;
}

.matcher__others {
  list-style: none;
  margin-top: 0.4rem;
  border-top: 1px solid var(--rule);
}

.matcher__others li {
  border-bottom: 1px solid var(--rule);
}

.matcher__other {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 9px 4px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}

.matcher__other:hover {
  background: rgb(0 0 0 / 0.04);
}

.matcher__dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--rule);
  flex-shrink: 0;
}

.matcher__other-name {
  flex: 1;
  font-weight: 600;
}

.matcher__other-hex {
  font-size: 0.85rem;
  font-stretch: 90%;
  color: var(--ink-soft);
}

@media (max-width: 800px) {
  .matcher__body {
    grid-template-columns: 1fr;
  }

  .matcher__compare {
    min-height: 200px;
  }
}
</style>
