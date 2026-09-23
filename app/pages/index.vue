<script setup lang="ts">
import type { Palette } from '~/types'

const api = usePalettes()

const { data: popular, error, refresh } = await useAsyncData('popular-home', () => api.feed('popular', 0, 4))
const { data: fresh, error: freshError, refresh: refreshFresh } = await useAsyncData('fresh-home', () => api.feed('new', 0, 4))

// Three chips hang in the hero. Before anyone has published, show samples.
const SAMPLES: Palette[] = [
  ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
  ['#0b132b', '#1c2541', '#3a506b', '#5bc0be', '#e0fbfc'],
  ['#ffcdb2', '#ffb4a2', '#e5989b', '#b5838d', '#6d6875'],
].map((colors, i) => ({
  id: `sample-${i}`,
  author_id: '',
  name: ['Harbour', 'Night shift', 'Dried roses'][i]!,
  colors,
  like_count: 0,
  created_at: '',
  author: null,
}))

const heroChips = computed(() => ((popular.value?.length ?? 0) >= 3 ? popular.value!.slice(0, 3) : SAMPLES))
const isSample = computed(() => heroChips.value === SAMPLES)

const steps = [
  { title: 'Mix', text: 'Press space until five colors sit well together. Pin the ones you want to keep and mix the rest again.' },
  { title: 'Publish', text: 'Give it a name. It goes up on the rack for everyone to see.' },
  { title: 'Collect', text: 'Heart the chips you’d actually paint a wall with. The most-hearted move to the front.' },
]
</script>

<template>
  <div>
    <section class="hero container">
      <HangingCard class="hero__sign" size="lg">
        <h1 class="hero__title display">Choose your colors.</h1>
        <p class="lede">A paint counter for palettes. Mix five colors, hang them on the rack, and see what everyone else picked.</p>
        <div class="hero__ctas">
          <NuxtLink to="/generate" class="btn btn--big">Mix a palette</NuxtLink>
          <NuxtLink to="/explore" class="btn btn--big btn--plain">Browse the rack</NuxtLink>
        </div>
      </HangingCard>

      <div class="hero__chips" :class="{ 'is-sample': isSample }">
        <PaintChip
          v-for="(p, i) in heroChips"
          :key="p.id"
          :palette="p"
          :tilt="[-7, 2, 9][i]"
          :sample="isSample"
          class="hero__chip"
        />
      </div>
    </section>

    <ColorOfTheDay />

    <section class="container how">
      <div class="how__card card-stock">
        <h2 class="how__title">How it works</h2>
        <ol class="how__steps">
          <li v-for="(s, i) in steps" :key="s.title">
            <span class="how__num" aria-hidden="true">{{ i + 1 }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="container matcher-wrap">
      <ColorMatcher />
    </section>

    <section class="container shelf">
      <div class="shelf__head board-label">
        <h2 class="shelf__title">Most hearted</h2>
        <NuxtLink to="/explore?sort=popular" class="shelf__all">See all</NuxtLink>
      </div>
      <QueryError v-if="error" message="The rack didn't load." @retry="refresh()" />
      <div v-else-if="popular?.length" class="rack">
        <PaintChip v-for="p in popular" :key="p.id" :palette="p" />
      </div>
      <p v-else class="empty">
        Nothing on the rack yet. <NuxtLink to="/generate">Mix the first palette.</NuxtLink>
      </p>
    </section>

    <section v-if="fresh?.length || freshError" class="container shelf">
      <div class="shelf__head board-label">
        <h2 class="shelf__title">Fresh off the counter</h2>
        <NuxtLink to="/explore" class="shelf__all">See all</NuxtLink>
      </div>
      <QueryError v-if="freshError" message="The newest palettes didn't load." @retry="refreshFresh()" />
      <div v-else class="rack">
        <PaintChip v-for="p in fresh" :key="p.id" :palette="p" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  align-items: center;
  gap: 3rem;
  padding-top: 5rem;
  padding-bottom: 5rem;
}

.hero__title {
  font-size: clamp(3rem, 7.2vw, 6.6rem);
  color: var(--brand);
  margin-bottom: 1.5rem;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 2.25rem;
}

/* Three chips on three pegs, overlapping like a fan. */
.hero__chips {
  position: relative;
  height: 440px;
}

/* Two classes deep so this beats PaintChip's own `position: relative`,
   whichever stylesheet happens to load last. */
.hero__chips > .hero__chip {
  position: absolute;
  top: 0;
  width: 215px;
}

/* the middle chip hangs in front; the outer two peek out either side */
.hero__chip:nth-child(1) { left: 0; top: 34px; }
.hero__chip:nth-child(2) { left: 31%; top: 0; z-index: 1; }
.hero__chip:nth-child(3) { left: 62%; top: 48px; }

/* The one entrance on the site: the chips are hung and swing to rest. */
.hero__chip :deep(.chip__card) {
  animation: hang 1.6s cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

.hero__chip:nth-child(2) :deep(.chip__card) { animation-delay: 0.12s; }
.hero__chip:nth-child(3) :deep(.chip__card) { animation-delay: 0.24s; }

@keyframes hang {
  0% { transform: rotate(calc(var(--tilt) + 22deg)); opacity: 0; }
  12% { opacity: 1; }
  35% { transform: rotate(calc(var(--tilt) - 9deg)); }
  58% { transform: rotate(calc(var(--tilt) + 4deg)); }
  78% { transform: rotate(calc(var(--tilt) - 1.5deg)); }
  100% { transform: rotate(var(--tilt)); }
}

.how {
  padding-top: 5rem;
}

.matcher-wrap {
  padding-top: 5rem;
}

.how__card {
  padding: 2.5rem clamp(1.5rem, 4vw, 3rem) 3rem;
}

.how__title {
  font-size: 1.6rem;
  font-weight: 800;
  font-stretch: 100%;
  margin-bottom: 1.75rem;
}

.how__steps {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem 3rem;
}

.how__num {
  display: block;
  font-size: 3.5rem;
  font-weight: 900;
  font-stretch: 112%;
  line-height: 1;
  color: var(--brand);
  margin-bottom: 0.6rem;
}

.how__steps h3 {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.how__steps p {
  color: var(--ink-soft);
  max-width: 34ch;
}

.shelf {
  padding-top: 5rem;
}

.shelf:last-child {
  padding-bottom: 6rem;
}

.shelf__head {
  margin-bottom: 2rem;
}

.shelf__title {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  font-weight: 900;
  font-stretch: 112%;
  letter-spacing: -0.01em;
}

.shelf__all {
  font-weight: 700;
  text-underline-offset: 4px;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: 0;
    gap: 2rem;
  }

  .hero__chips {
    height: 420px;
    max-width: 520px;
  }

  .how__steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .hero__chips > .hero__chip {
    width: 190px;
  }

  .hero__chip:nth-child(2) { left: 22%; }
  .hero__chip:nth-child(3) { left: 44%; }

  .hero__chips {
    height: 380px;
  }
}
</style>
