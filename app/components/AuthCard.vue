<script setup lang="ts">
// A white card hung on the board by two pegs — the frame for the log-in
// and sign-up forms. <slot /> is where the page's own form goes.
defineProps<{ title: string, lede?: string }>()
</script>

<template>
  <section class="auth-card">
    <span class="peg auth-card__peg auth-card__peg--left" aria-hidden="true" />
    <span class="peg auth-card__peg auth-card__peg--right" aria-hidden="true" />
    <div class="auth-card__body">
      <h1 class="auth-card__title">{{ title }}</h1>
      <p v-if="lede" class="auth-card__lede">{{ lede }}</p>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.auth-card {
  --hole-inset: 30px;
  --hole-y: 24px;
  position: relative;
  width: 100%;
  max-width: 460px;
}

.auth-card__body {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--hang-shadow);
  padding: 58px clamp(22px, 5vw, 40px) 36px;
  /* two punched holes the pegs go through */
  mask:
    radial-gradient(circle 8px at var(--hole-inset) var(--hole-y), transparent 97%, #000 100%),
    radial-gradient(circle 8px at calc(100% - var(--hole-inset)) var(--hole-y), transparent 97%, #000 100%);
  mask-composite: intersect;
}

.auth-card__peg {
  top: calc(var(--hole-y) - 7px);
}

.auth-card__peg--left {
  left: calc(var(--hole-inset) - 7px);
}

.auth-card__peg--right {
  right: calc(var(--hole-inset) - 7px);
}

.auth-card__title {
  font-size: clamp(2.2rem, 5vw, 2.9rem);
  font-weight: 900;
  font-stretch: 112%;
  line-height: 1;
  letter-spacing: -0.02em;
}

.auth-card__lede {
  margin-top: 0.6rem;
  color: var(--ink-soft);
  max-width: 34ch;
}

/* Form parts used by both pages */
.auth-card :deep(form) {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  margin-top: 2rem;
}

.auth-card :deep(.field__hint) {
  font-size: 0.9rem;
  color: var(--ink-soft);
  min-height: 1.35em;
}

.auth-card :deep(.field__hint.is-good) {
  color: #1d6b35;
}

.auth-card :deep(.field__hint.is-bad) {
  color: var(--danger);
}

/* An input with something stuck to it: "@" before, "Show" after. */
.auth-card :deep(.affix) {
  display: flex;
  align-items: stretch;
  border: 1.5px solid var(--ink);
  border-radius: var(--radius);
  background: #fff;
}

.auth-card :deep(.affix:focus-within) {
  outline: 3px solid var(--brand);
}

.auth-card :deep(.affix .input) {
  border: none;
  outline: none;
  min-width: 0;
}

.auth-card :deep(.affix__before) {
  display: grid;
  place-items: center;
  padding-left: 13px;
  font-weight: 700;
  color: var(--ink-soft);
}

.auth-card :deep(.affix .affix__before + .input) {
  padding-left: 3px;
}

.auth-card :deep(.affix__after) {
  border: none;
  background: none;
  padding: 0 14px;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--brand);
  cursor: pointer;
}

.auth-card :deep(.btn[type="submit"]) {
  width: 100%;
  margin-top: 0.4rem;
}

.auth-card :deep(.auth-card__switch) {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--rule);
  color: var(--ink-soft);
}

.auth-card :deep(.auth-card__switch a) {
  color: var(--brand);
  font-weight: 700;
}
</style>
