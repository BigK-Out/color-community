<script setup lang="ts">
// The hero from the first site, now leading somewhere.
const api = usePalettes()

const { data: trending, error, refresh } = await useAsyncData('trending', () => api.feed('popular', 0, 8))

const steps = [
  { title: 'Generate', text: 'Hit space until something clicks. Lock the colours you love.' },
  { title: 'Publish', text: 'Name it and share it with everyone.' },
  { title: 'Get liked', text: 'The best palettes rise to the top of Popular.' },
]
</script>

<template>
  <div>
    <section class="hero">
      <div class="hero__container container">
        <h1 class="hero__heading">
          Choose your <span class="gradient-text gradient-text--warm">colors</span>
        </h1>
        <p class="hero__description gradient-text">Unlimited Possibilities</p>
        <div class="hero__ctas">
          <NuxtLink to="/generate" class="btn btn--big">Start generating</NuxtLink>
          <NuxtLink to="/explore" class="btn btn--big btn--ghost">Explore</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section container">
      <h2 class="section__title gradient-text gradient-text--fresh">How it works</h2>
      <div class="steps">
        <div v-for="step in steps" :key="step.title" class="step">
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </div>
      </div>
    </section>

    <section class="section container">
      <div class="section__head">
        <h2 class="section__title gradient-text gradient-text--logo">Trending</h2>
        <NuxtLink to="/explore?sort=popular" class="muted">See all →</NuxtLink>
      </div>
      <QueryError v-if="error" @retry="refresh()" />
      <div v-else-if="trending?.length" class="palette-grid">
        <PaletteCard v-for="p in trending" :key="p.id" :palette="p" />
      </div>
      <p v-else class="empty">
        Nothing here yet. <NuxtLink to="/generate">Publish the first palette.</NuxtLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: var(--bg-hero);
  padding: 160px 0;
}

.hero__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero__heading {
  font-size: clamp(3.2rem, 9vw, 6.25rem);
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero__description {
  font-size: clamp(2rem, 5vw, 3.75rem);
}

.hero__ctas {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2.5rem;
}

.section {
  padding-top: 6rem;
}

.section:last-child {
  padding-bottom: 6rem;
}

.section__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.section__title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

/* The gradient service cards from the first site */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.step {
  min-height: 260px;
  border-radius: var(--radius);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  gap: 1rem;
  transition: transform 0.3s ease-in;
}

.step:hover {
  transform: scale(1.04);
}

.step h3 {
  font-size: 1.8rem;
}

.step p {
  font-size: 1.15rem;
}

.step:nth-child(1) { background: linear-gradient(to right, #fdbb2d, #b21f1f, #1a2a6c); }
.step:nth-child(2) { background: linear-gradient(to right, #2ebf91, #8360c3); }
.step:nth-child(3) { background: linear-gradient(to right, #dbd65c, #5614b0); }
</style>
