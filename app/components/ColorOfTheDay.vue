<script setup lang="ts">
// A full-width band painted in one named colour, a new one each day.

// Today's date (UTC) decided once on the server and reused in the browser,
// so both render the same colour.
const today = useState('today', () => new Date().toISOString().slice(0, 10))

const color = computed(() => colorOfTheDay(today.value))
const fg = computed(() => textColorFor(color.value.hex))

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${today.value}T00:00:00Z`)),
)

// An analogous palette built around the colour, seeded by the date so the
// link is the same on the server and in the browser.
const mixLink = computed(() => {
  const seed = Number(today.value.replace(/-/g, ''))
  const colors = harmonize(
    [color.value.hex, '#000000', '#000000', '#000000', '#000000'],
    [true, false, false, false, false],
    'analogous',
    seededRandom(seed),
  )
  return `/generate?c=${encodeColors(colors)}`
})
</script>

<template>
  <section class="cotd" :style="{ background: color.hex, color: fg }" aria-labelledby="cotd-name">
    <div class="container cotd__inner">
      <p class="cotd__when">Colour of the day, {{ dateLabel }}</p>
      <h2 id="cotd-name" class="cotd__name">{{ color.name }}</h2>
      <div class="cotd__foot">
        <span class="cotd__hex">#{{ color.hex.slice(1).toUpperCase() }}</span>
        <NuxtLink :to="mixLink" class="btn btn--plain">Mix a palette around it</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cotd {
  margin-top: 1rem;
  border-top: 4px solid rgb(0 0 0 / 0.18);
  border-bottom: 4px solid rgb(0 0 0 / 0.18);
}

.cotd__inner {
  padding-top: 4.5rem;
  padding-bottom: 4rem;
}

.cotd__when {
  font-weight: 600;
  font-size: 1.1rem;
  opacity: 0.85;
}

.cotd__name {
  font-size: clamp(3.2rem, 11vw, 10rem);
  font-weight: 900;
  font-stretch: 125%;
  line-height: 0.9;
  letter-spacing: -0.03em;
  margin: 0.6rem 0 2.2rem;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.cotd__foot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}

.cotd__hex {
  font-size: 1.3rem;
  font-weight: 700;
  font-stretch: 90%;
}
</style>
