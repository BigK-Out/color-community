<script setup lang="ts">
// A white card hung on the board by two pegs. Anything with words on it
// goes on one of these — text straight on the pegboard is hard to read.
withDefaults(defineProps<{ tag?: string, size?: 'md' | 'lg' }>(), { tag: 'section', size: 'md' })
</script>

<template>
  <component :is="tag" class="hang" :class="`hang--${size}`">
    <span class="peg hang__peg hang__peg--left" aria-hidden="true" />
    <span class="peg hang__peg hang__peg--right" aria-hidden="true" />
    <div class="hang__body">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.hang {
  --hole-inset: 30px;
  --hole-y: 22px;
  position: relative;
}

.hang__body {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--hang-shadow);
  padding: 50px clamp(22px, 4vw, 36px) 30px;
  /* two punched holes the pegs go through */
  mask:
    radial-gradient(circle 8px at var(--hole-inset) var(--hole-y), transparent 97%, #000 100%),
    radial-gradient(circle 8px at calc(100% - var(--hole-inset)) var(--hole-y), transparent 97%, #000 100%);
  mask-composite: intersect;
}

.hang--lg .hang__body {
  padding: 60px clamp(24px, 5vw, 52px) 44px;
}

.hang__peg {
  top: calc(var(--hole-y) - 7px);
}

.hang__peg--left {
  left: calc(var(--hole-inset) - 7px);
}

.hang__peg--right {
  right: calc(var(--hole-inset) - 7px);
}
</style>
